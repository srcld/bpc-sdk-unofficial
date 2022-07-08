const nExtJs = require('@muzkat/nextjs-tools'),
    war = require('@srcld/war'),
    {getBuildFile} = require('./build/buildFile'),
    {createSettingsFile} = require('./settings/SettingsHelper'),
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
 * @returns {Promise<*>}
 */
const buildPackage = (moduleName = '', sources = [], applicationName = '') => {
    const builder = getBPCBuilder(moduleName);
    return builder
        .build()
        .then((success) => {
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