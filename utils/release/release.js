const {readFileSync, writeFileSync} = require('fs'),
    shell = require('shelljs'),
    log = console.log;

////////////////// FILE HANDLING

const propertiesFile = 'gradle.properties';
const developmentSuffix = '-SNAPSHOT';

const releaseCommitPrefix = 'Release';
const devCommitPrefix = 'Version bump';
const prefixVersionDivider = ': ';

const tagPrefix = 'v.';

const read = function (path) {
    return readFileSync(path, 'utf8');
}

const propsToArray = function (data = '') {
    return data
        .trim()
        .split('\n')
        .filter((i) => (i || '').trim().length > 0)
        .map((i) => {
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

const updateVersion = function (array = [], versionKey) {
    let exitCode, nextVersion;

    const newPropsArray = array.map((obj) => {
        if (obj.key === versionKey) {
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
const updateVersionInGradleProperties = function (file = propertiesFile, versionKey) {
    const dataBefore = read(file);
    const arrayData = propsToArray(dataBefore);
    console.table(arrayData);
    const {release, data, nextVersion} = updateVersion(arrayData, versionKey);
    const text = arrayToProps(data);
    log('UPDATED GRADLE PROPERTIES: ');
    log(text);
    write(text);
    return {release, nextVersion};
}

const systemCheck = function () {
    if (!shell.which('git')) {
        consoleShell('Sorry, this script requires git');
        return false;
    }
    return true;
}


////// GIT stuff

const commitAndPushAllChanges = function (commitMessage = '', push = true) {
    if (commitMessage.length === 0) {
        ///
        return;
    }

    if (runError(exec('git commit -am "' + commitMessage + '"'))) {
        consoleShell('Error: Git commit failed');
        return false
    }

    if (push) {
        return pushChanges();
    }
    return true;
}

const pushChanges = function () {
    if (runError(exec('git push'))) {
        consoleShell('Error: Git push failed');
        return false
    }
    return true;
}

const exec = function (cmd = '') {
    return shell.exec(cmd);
}

const runError = function (execObj = {}) {
    const {code} = execObj;
    return code !== 0;
};

const consoleShell = function (message = '') {
    shell.echo(message);
}

const createTag = function (tagMessage = '') {
    if (tagMessage.length === 0) {
        ///
        return;
    }

    if (runError(exec('git tag "' + tagMessage + '"'))) {
        consoleShell('Error: Git tagging failed');
        return false
    }

    if (runError(exec('git push --tags'))) {
        consoleShell('Error: Git pushing tags failed');
        return false
    }

    return true;
}

const getCommitMessage = function (release, nextVersion) {
    return (release ? releaseCommitPrefix : devCommitPrefix) + prefixVersionDivider + nextVersion;
}

const getTagMessage = function (nextVersion) {
    return tagPrefix + nextVersion;
}
const doRelease = function (options = {
    versionKeys: ['version']
}) {
    if (!systemCheck()) {
        log('SORRY, SYSTEM CHECK FAILED.');
        return;
    }

    let {versionKeys = []} = options;
    log('VERSION KEYS LENGTH: ' + versionKeys.length);
    if (versionKeys.length === 0) {
        log('NO VERSION KEY DEFINED');
        return;
    }

    log('UPDATING VERSION FILES....');

    versionKeys
        .map((versionKey) => {
            const {release, nextVersion} = updateVersionInGradleProperties(undefined, versionKey);
            const commitText = getCommitMessage(release, nextVersion);
            log('COMMITTING: ' + commitText);
            commitAndPushAllChanges(commitText, false);
            if (release) {
                let msg = getTagMessage(nextVersion);
                log('TAGGING: ' + msg);
                createTag(msg);
            }
        })

    log('PUSH UPPP');
    pushChanges();
    log('DONE.');
};

module.exports = {updateVersionInGradleProperties, doRelease, createTag, commitAndPushAllChanges}