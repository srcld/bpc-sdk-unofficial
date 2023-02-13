const prefix = '/bpc-fe-';

/**
 * get BPC compliant bundle name
 *
 * @returns {string}
 * @param moduleName
 */
const compatPathBuilder = (moduleName) => prefix + moduleName;

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

const defaults = {
    'Manifest-Version': '1.0',
    'Bundle-ManifestVersion': '2'
};

const bpcDefaults = {
    'BPC-Bundle': 'true',
    'BPC-Bundle-Type': 'fe-only'
}
const getManifest = (applicationDisplayName = '', moduleName = '', version = '0.0.1', buildInfo = 'NOT DEFINED') => {

    const manifestArray = [{
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
        key: 'BPC-Bundle-Id', value: moduleName
    }];

    Object.keys(defaults).map((key) => {
        manifestArray.push({key, value: defaults[key]})
    })

    Object.keys(bpcDefaults).map((key) => {
        manifestArray.push({key, value: bpcDefaults[key]})
    })

    return manifestArray;
}


const getWarBuildConfigObject = (moduleName = '', targetFolder = 'build', sources = [], manifestData = [], clean = true) => {
    return {name: moduleName, targetFolder: targetFolder, sources: sources, manifestArray: manifestData, clean};
}

module.exports = {getManifest, getWarBuildConfigObject}