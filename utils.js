/**
 * get BPC compliant bundle name
 *
 * @returns {string}
 * @param moduleName
 */
const compatPathBuilder = (moduleName) => 'bpc-fe-' + moduleName;

/**
 * get BPC compliant manifest array, used in later build steps
 * right now, fe-only modules are supported
 *
 * @returns {string}
 * @param applicationDisplayName
 * @param moduleName
 * @param version
 * @param buildInfo
 */
const getManifest = (applicationDisplayName = '', moduleName = '', version = '0.0.1', buildInfo = '4711') => {
    return [{
        key: 'Manifest-Version', value: '1.0'
    }, {
        key: 'Bundle-SymbolicName', value: applicationDisplayName
    }, {
        key: 'Bundle-Name', value: applicationDisplayName
    }, {
        key: 'Bundle-Version', value: version
    }, {
        key: 'Build', value: buildInfo
    }, {
        key: 'Web-ContextPath', value: compatPathBuilder(moduleName)
    }, {
        key: 'Webapp-Context', value: compatPathBuilder(moduleName)
    }, {
        key: 'BPC-Bundle', value: 'true'
    }, {
        key: 'BPC-Bundle-Id', value: moduleName
    }, {
        key: 'BPC-Bundle-Type', value: 'fe-only'
    }, {
        key: 'Bundle-ManifestVersion', value: '2'
    }];
}


const getWarBuildConfigObject = (moduleName = '', targetFolder = 'build', sources = [], manifestData = []) => {

    return {name: moduleName, targetFolder: targetFolder, sources: sources, manifestArray: manifestData};
}

module.exports = {getManifest, getWarBuildConfigObject}