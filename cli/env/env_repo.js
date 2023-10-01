const {fileExists} = require("../../utils/file/file");
let log = console.log;
const isValidRepo = function (fileName = '') {
    let path = './' + fileName;
    let exists = fileExists(path);
    if (!exists) log('Version file does not exist: ' + fileName);
    return exists === true;
}

const pomFile = 'pom.xml';
const gradleFile = 'gradle.properties';

const versionFiles = [{file: pomFile, method: 'xml'}, {file: gradleFile, method: 'release'}];

const detectRepo = function () {
    const matches = versionFiles.filter((obj) => {
        let {file, method} = obj;
        return fileExists(file);
    });
    if (matches.length && matches.length === 1) {
        log(matches[0].method + ' detected');
        return matches[0].method;
    } else {
        log('repo / env / path not valid');
    }
}

module.exports = {detectRepo, isValidRepo};