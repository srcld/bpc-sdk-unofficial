const nExtJs = require('@muzkat/nextjs-tools'),
    war = require('@srcld/war'),
    {getBuildFile} = require('./utils/buildFile'),
    {getSourcesArray, prepareWorkspace} = require('./utils/file/dir'),
    {
        createSettingsFile,
        handleSettings,
        readSettingsFile,
        groupedToSortedJson,
        migrateSettingFile
    } = require('./utils/settings/SettingsHelper'),
    release = require('./utils/release/release'),
    {getManifest, getWarBuildConfigObject} = require('./utils');
const {logLine, log} = require("@srcld/sourlog");
const {readJson} = require("./utils/release/release");
const {fileExists} = require("./utils/file/file");
const {getDirectories} = require("@muzkat/nextjs-tools/utils/file");

/**
 * get nExtJs-tools builder for your module (Ext Js Package)
 *
 * @param moduleName
 * @returns {{getAppConfig: function(*, *): *, buildFile: *, build: function(*=): Promise<{buildConfig: *, success: boolean, buildDir: string}>, createPackage: function(*=, *=, *=): *, clean: function(*=): void, createWarPackage: function(*=, *=, *=): *, deploy: function(): Promise<void>}}
 */
const getBPCBuilder = (moduleName) => {
    return nExtJs(getBuildFile(moduleName));
}

/**
 * create your BPC compliant war module (ExtJS package wrapped in a web application archive, with special MANIFEST headers for Apache Karaf)
 *
 * @param moduleName
 * @param sources
 * @param applicationName
 * @param version
 * @param buildInfo
 * @returns {Promise<*>}
 */
const buildWar = (moduleName = '', sources = [], applicationName = '', version, buildInfo) => {
    return war.buildByConfig(getWarBuildConfigObject(moduleName, undefined, sources, getManifest(applicationName, moduleName, version, buildInfo)));
}

/**
 * One stop build check out. Hello.
 *
 * @param moduleName
 * @param applicationName
 * @param settings
 * @param version
 * @param buildInfo
 * @returns {Promise<*>}
 */
const buildPackage = (moduleName = '', applicationName = '', settings = {}, version, buildInfo) => {
    return getBPCBuilder(moduleName)
        .build()
        .then((buildObject) => {
            let resourcesBasePath = prepareWorkspace(moduleName);
            handleSettings(settings, resourcesBasePath + '/');
            return getSourcesArray(moduleName);
        }).then((sources) => {
            return buildWar(moduleName, sources, applicationName, version, buildInfo)
        })
}

const findPackages = function (path, searchExclusion = ['local', 'remote']) {
    let dirs = getDirectories(path);
    dirs = dirs
        .filter((name) => searchExclusion.indexOf(name) === -1)
        .filter((name) => {
            log('SEARCHING FOR: package.json');
            const packageJsonExists = fileExists(path + '/' + name + '/package.json');
            log('FOUND: ' + packageJsonExists);
            return packageJsonExists;
        });
    log(dirs.length === 0 ? 'PROBABLY NO PACKAGES FOLDER' : 'PACKAGES FOUND.');
    if (dirs.length) log(dirs);
    return dirs;
}

const autoDetectEnv = function () {
    log('AUTODETECT ENV.');
    logLine();

    let srcDir, buildPackagesDir, moduleName;
    if (fileExists('workspace.json')) {
        let json = readJson('workspace.json');
        let {frameworks, build, packages} = json || {};
        let {ext} = frameworks || {};
        let {dir} = build;
        let packagesDir = packages.dir;
        log('FRAMEWORK: ' + ext);
        log('BUILD DIR: ' + dir);
        log('PACKAGE D: ' + packagesDir);
        logLine();

        const workspaceReplacer = '${workspace.dir}/';
        dir = dir.replace(workspaceReplacer, '');
        packagesDir = packagesDir.replaceAll(workspaceReplacer, '');
        log('CLEANED DIRS:');
        log(dir);
        log(packagesDir);
        logLine();

        // buildDir
        if (fileExists(dir)) {
            log('BUILD DIR EXISTS')
        }
        // package/s dir
        let parts = packagesDir.split(',')
        if (parts.length) {
            parts.map((part) => {
                logLine()
                log('SEARCHING FOR: ' + part);
                if (fileExists(part)) {
                    log(part + ' FOUND.')
                    const packagesNames = findPackages(part)
                    if (packagesNames.length) {
                        log('MODULE NAME SET TO:');
                        moduleName = packagesNames[0];
                        log(moduleName);
                        const folderParts = part.split('/');
                        if (folderParts.length === 2) {
                            if (folderParts[0] === 'packages') srcDir = folderParts[0];
                            if (folderParts[1] === 'local') buildPackagesDir = folderParts[1];
                        }
                        log('SRC DIR:' + srcDir);
                        log('PACKAGES DIR' + buildPackagesDir);
                    }
                }
            })
        }
        return {srcDir, buildPackagesDir, moduleName};
    }
    return false;
}

const getBuildObject = function (moduleName, srcDir, packagesDir) {
    const buildDescriptor = getBPCBuilder(moduleName);
    if (buildDescriptor && buildDescriptor.buildFile) {
        buildDescriptor.buildFile.srcDir = srcDir || 'packages'
        buildDescriptor.buildFile.packagesDir = packagesDir || 'local'
    }
    return buildDescriptor;
}

const buildLegacyBpcPackage = function (moduleName, version) {
    let srcDir, packagesDir;
    log('BPC SDK UNOFFICIAL.');

    if (typeof moduleName === 'undefined' && typeof version === 'undefined') {
        logLine();
        log('NO PARAMETERS SET.');
        let config = autoDetectEnv();
        if (config === false) {
            log('ENV NOT DETECTED / SUPPORTED. STOPPING HERE.', 'w');
            return;
        }
        if (config.srcDir) srcDir = config.srcDir;
        if (config.buildPackagesDir) packagesDir = config.buildPackagesDir;
        if (config.moduleName) moduleName = config.moduleName;
        logLine();
    }

    version = version || release.readKeyFromGradleProperties('version');
    moduleName = moduleName || release.readKeyFromGradleProperties('packageName') || 'NOT FOUND';

    log('MODULE_NAME: ' + moduleName);
    let symbolicName = release.readKeyFromGradleProperties('symbolicName') || 'NOT FOUND';
    log('SYMBOLIC_NAME: ' + moduleName);

    const buildDescriptor = getBuildObject(moduleName, srcDir, packagesDir);
    // todo handle settings
    return buildDescriptor
        .build()
        .then((buildObject) => {
            prepareWorkspace(moduleName, false);
            // in legacy build we do not want "our" setting handling - leave it as is
            // ignored therefore now -> handleSettings(settings, resourcesBasePath + '/');
            return getSourcesArray(moduleName);
        }).then((sources) => {
            return buildWar(moduleName, sources, symbolicName, version);
        })
}


module.exports = {
    buildLegacyBpcPackage,
    getBuildFile,
    createSettingsFile,
    getManifest,
    getWarBuildConfigObject,
    getBPCBuilder,
    buildPackage,
    release,
    readSettingsFile,
    groupedToSortedJson,
    migrateSettingFile
}