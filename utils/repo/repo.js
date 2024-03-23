const {getArtifactIdFromXml, getValueFromGradleProperties} = require("../release/release");
const {fileExists} = require("../file/file");
const {doLog} = require("../log/sourlog");
const {FILE_NAME_POM, FILE_NAME_GRADLE} = require("../props");

const getModuleName = function () {
    let repoVariant = detectRepo(true);
    if (repoVariant) {
        if (repoVariant === bpcRepoTypeBe) return (getArtifactIdFromXml() || '').replace('bpc-be-', '').trim();
        if (repoVariant === bpcRepoTypeFe) return getValueFromGradleProperties();
    }
}

const frontendMethod = 'release';
const backendMethod = 'xml';

const bpcRepoTypeBe = 'be';
const bpcRepoTypeFe = 'fe';

const versionFiles = [
    {
        file: FILE_NAME_POM,
        method: backendMethod,
        bpcRepoType: bpcRepoTypeBe
    },
    {
        file: FILE_NAME_GRADLE,
        method: frontendMethod,
        bpcRepoType: bpcRepoTypeFe
    }];

// return method (release or xml) or repo type (fe or be)
const detectRepo = function (returnBpcRepoType = false) {
    const matches = versionFiles
        .filter((obj) => {
            let {file, method} = obj;
            return fileExists(file);
        });

    const [firstMatch] = matches;

    if (matches.length === 1) {
        let {method, bpcRepoType} = firstMatch || {};
        let targetValue = returnBpcRepoType ? bpcRepoType : method;
        doLog(targetValue + ' detected', 'd');
        return targetValue;
    } else {
        doLog('repo / env / path not valid');
    }
}

module.exports = {getModuleName, detectRepo}