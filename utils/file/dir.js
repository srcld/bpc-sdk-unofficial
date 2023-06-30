const war = require("@srcld/war");

const buildDir = 'build';
const resourcesDir = 'resources';
const settingsDir = 'defaults';

const getResourcesBasePath = function (moduleName) {
    return './' + ([buildDir, moduleName, resourcesDir].join('/'));
}

const getSrcDir = function (moduleName) {
    return [buildDir, moduleName].join('/');
}

const getSourcesArray = function (moduleName) {
    return [{
        source: getSrcDir(moduleName),
        target: false
    }];
}

const prepareWorkspace = function (moduleName, createDefaultsFolder = true) {
    let resourcesBasePath = getResourcesBasePath(moduleName);
    war.createFolderIfNotPresent(resourcesBasePath);
    if(createDefaultsFolder){
        resourcesBasePath += '/' + settingsDir;
        war.createFolderIfNotPresent(resourcesBasePath);
    }
    return resourcesBasePath;
}

module.exports = {getSourcesArray, prepareWorkspace};