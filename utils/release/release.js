const {readFileSync, writeFileSync} = require('fs'),
    shell = require('shelljs');

////////////////// FILE HANDLING

const propertiesFile = 'gradle.properties';
const versionProperty = 'version';
const developmentSuffix = '-SNAPSHOT';

const releaseCommitPrefix = 'Release';
const devCommitPrefix = 'Version bump';
const prefixVersionDivider = ': ';

const tagPrefix = 'v.';

const read = function (path) {
    return readFileSync(path, 'utf8');
}

const propsToArray = function (data = '') {
    return data.split('\n').map((i) => {
        let parts = i.split('=');
        return {
            key: parts[0],
            value: parts[1]
        };
    });
}

const arrayToProps = function (data = []) {
    return data.map((obj) => obj.key + '=' + obj.value).join('\n');
}

const updateVersion = function (array = []) {
    let exitCode, nextVersion;

    const newPropsArray = array.map((obj) => {
        if (obj.key === versionProperty) {
            if (obj.value.endsWith(developmentSuffix)) {
                obj.value = obj.value.replace(developmentSuffix, '');
                exitCode = 0;
            } else {
                let versionParts = obj.value.split('.').map((s) => parseInt(s));
                versionParts[versionParts.length - 1] = versionParts[versionParts.length - 1] + 1;
                obj.value = versionParts.join('.') + developmentSuffix;
                exitCode = 1;
            }
            nextVersion = obj.value;
        }
        return obj;
    });
    return {
        data: newPropsArray,
        release: exitCode === 0,
        nextVersion
    }
}

const write = (data) => {
    writeFileSync(propertiesFile, data);
}

/**
 * This functions will update your gradle.properties file automatically,
 * in order to support side by side builds using Sencha Cmd
 *
 * @returns {{release: boolean, nextVersion}}
 */
const updateVersionInGradleProperties = function () {
    const dataBefore = read(propertiesFile);
    const arrayData = propsToArray(dataBefore);
    const {release, data, nextVersion} = updateVersion(arrayData);
    const text = arrayToProps(data);
    write(text);
    return {release, nextVersion};
}

const systemCheck = function () {
    if (!shell.which('git')) {
        shell.echo('Sorry, this script requires git');
        return false;
    }
    return true;
}


////// GIT stuff

const commitAndPushAllChanges = function (commitMessage = '') {
    if (commitMessage.length === 0) {
        ///
        return;
    }

    if (shell.exec('git commit -am "' + commitMessage + '"').code !== 0) {
        shell.echo('Error: Git commit failed');
        return false
    }

    if (shell.exec('git push').code !== 0) {
        shell.echo('Error: Git push failed');
        return false
    }

    return true;
}

const createTag = function (tagMessage = '') {
    if (tagMessage.length === 0) {
        ///
        return;
    }

    if (shell.exec('git tag "' + tagMessage + '"').code !== 0) {
        shell.echo('Error: Git tagging failed');
        return false
    }

    if (shell.exec('git push --tags').code !== 0) {
        shell.echo('Error: Git pushing tags failed');
        return false
    }

    return true;
}

const doRelease = function () {
    if (!systemCheck()) {
        ///
        return;
    }
    const {release, nextVersion} = updateVersionInGradleProperties();
    const commitText = (release ? releaseCommitPrefix : devCommitPrefix) + prefixVersionDivider + nextVersion;
    const tagMessage = release ? (tagPrefix + nextVersion) : undefined;
    commitAndPushAllChanges(commitText);
    if (release) createTag(tagMessage);
};


module.exports = {updateVersionInGradleProperties, doRelease, createTag, commitAndPushAllChanges}