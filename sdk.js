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


const buildLegacyBpcPackage = function (moduleName, version) {
    version = version || release.readKeyFromGradleProperties('version');
    moduleName = moduleName || release.readKeyFromGradleProperties('packageName');
    // overwrite internal config to fit to Sencha Cmd legacy standards
    // todo read corresponding files from repo
    const buildDescriptor = getBPCBuilder(moduleName);
    if (buildDescriptor && buildDescriptor.buildFile) {
        buildDescriptor.buildFile.srcDir = 'packages'
        buildDescriptor.buildFile.packagesDir = 'local'
    }

    // todo handle settings
    return buildDescriptor
        .build()
        .then((buildObject) => {
            prepareWorkspace(moduleName, false);
            // in legacy build we do not want "our" setting handling - leave it as is
            // ignored therefore now -> handleSettings(settings, resourcesBasePath + '/');
            return getSourcesArray(moduleName);
        }).then((sources) => {
            return buildWar(moduleName, sources, '', version);
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