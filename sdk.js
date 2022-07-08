const nExtJs = require('@muzkat/nextjs-tools'),
    war = require('@srcld/war'),
    {getBuildFile} = require('./utils/buildFile'),
    {createSettingsFile, handleSettings} = require('./utils/settings/SettingsHelper'),
    {getManifest, getWarBuildConfigObject} = require('./utils');

/**
 * get nextjs-tools builder for your module (Ext Js Package)
 *
 * @param moduleName
 * @returns {{getAppConfig: function(*): *, buildFile: *, generateBundles: function(*): Promise<*>, build: function(): Promise<boolean>, getPackageDirectories: function(*, *, *=): {packagePath: string, packageRoot: string, packagesPath: string, packageName: string}[], createPackage: function(*=, *=, *=): *, fetchFiles: function(*): *, generatePathsForPackages: function(*): *, createWarPackage: function(*=, *=, *=): *, deploy: function(): Promise<void>}}
 */
const getBPCBuilder = (moduleName) => {
    const buildFile = getBuildFile(moduleName)
    return nExtJs(buildFile);
}

/**
 * create your BPC compliant war module (ExtJS package wrapped in a web application archive, with special MANIFEST headers for Apache Karaf)
 *
 * @param moduleName
 * @param sources
 * @param applicationName
 * @returns {Promise<*>}
 */
const buildWar = (moduleName = '', sources = [], applicationName = '') => {
    return war.buildByConfig(getWarBuildConfigObject(moduleName, undefined, sources, getManifest(applicationName, moduleName)));
}

/**
 * One stop build check out. Hello.
 *
 * @param moduleName
 * @param sources
 * @param applicationName
 * @param settings
 * @returns {Promise<*>}
 */
const buildPackage = (moduleName = '', sources = [], applicationName = '', settings = {}) => {
    const builder = getBPCBuilder(moduleName);
    return builder
        .build()
        .then((buildObject) => {
            const buildDir = 'build'; // check why it's not an object...
            let resourcesBasePath = './' + buildDir + '/' + moduleName + '/resources';
            war.createFolderIfNotPresent(resourcesBasePath);
            resourcesBasePath += '/defaults';
            war.createFolderIfNotPresent(resourcesBasePath);
            handleSettings(settings, resourcesBasePath + '/');
            return buildWar(moduleName, sources, applicationName)
        })
}


module.exports = {
    getBuildFile,
    createSettingsFile,
    getManifest,
    getWarBuildConfigObject,
    getBPCBuilder,
    buildPackage
}