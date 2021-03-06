const nExtJs = require('@muzkat/nextjs-tools'),
    war = require('@srcld/war'),
    {getBuildFile} = require('./utils/buildFile'),
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
            const buildDir = 'build'; // check why it's not an object...
            let resourcesBasePath = './' + buildDir + '/' + moduleName + '/resources';
            war.createFolderIfNotPresent(resourcesBasePath);
            resourcesBasePath += '/defaults';
            war.createFolderIfNotPresent(resourcesBasePath);
            handleSettings(settings, resourcesBasePath + '/');

            const sources = [{
                source: [buildDir, moduleName].join('/'),
                target: false
            }];

            return buildWar(moduleName, sources, applicationName, version, buildInfo)
        })
}


module.exports = {
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