const {detectRepoVariant} = require("../../cli/env/env_repo");
const {getArtifactIdFromXml, getValueFromGradleProperties} = require("../release/release");

const getModuleName = function () {
    let repoVariant = detectRepoVariant();
    if (repoVariant) {
        if (repoVariant === 'be') {
                let artifactId = getArtifactIdFromXml() || '';
                return artifactId.replace('bpc-be-', '').trim();
        }
        if (repoVariant === 'fe') {
            return getValueFromGradleProperties();
        }
    }
}

module.exports = {getModuleName}