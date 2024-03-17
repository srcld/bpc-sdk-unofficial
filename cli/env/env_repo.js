const {fileExists} = require("../../utils/file/file");
const {doLog} = require("../../utils/log/sourlog");
const {FILE_NAME_POM, FILE_NAME_GRADLE} = require("../../utils/props");

const isValidRepo = function (fileName = '') {
    let path = './' + fileName;
    let exists = fileExists(path);
    if (!exists) doLog('Version file does not exist: ' + fileName);
    return exists === true;
}

const versionFiles = [
    {
        file: FILE_NAME_POM,
        method: 'xml'
    },
    {
        file: FILE_NAME_GRADLE,
        method: 'release'
    }];

const detectRepoVariant = function (){
    let method = detectRepo();
    if(method === 'release') return 'fe';
    if(method === 'xml') return 'be';
}

const detectRepo = function () {
    const matches = versionFiles.filter((obj) => {
        let {file, method} = obj;
        return fileExists(file);
    });
    if (matches.length && matches.length === 1) {
        doLog(matches[0].method + ' detected');
        return matches[0].method;
    } else {
        doLog('repo / env / path not valid');
    }
}

module.exports = {detectRepo, isValidRepo, detectRepoVariant};