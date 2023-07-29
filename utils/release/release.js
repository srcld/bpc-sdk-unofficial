const {readFileSync, writeFileSync} = require('fs'),
    shell = require('shelljs'),
    cheerio = require('cheerio');
const {logLine, log} = require("@muzkat/nextjs-tools/utils/log");


////////////////// FILE HANDLING

const propertiesFile = 'gradle.properties';
const developmentSuffix = '-SNAPSHOT';

const releaseCommitPrefix = 'Release';
const devCommitPrefix = 'Version bump';
const prefixVersionDivider = ': ';

const tagPrefix = 'v.';

const read = function (path, encoding = 'utf8') {
    return readFileSync(path, encoding);
}

const bumpPomXml = function (dry = false) {
    let release = false;
    let data = read('pom.xml')

    let pomCheerio = cheerio.load(data, {
        xmlMode: true
    });
    let foo = pomCheerio('project > version');

    let version = foo.text(),
        next = bumpVersion(version);
    if (!next.endsWith(developmentSuffix)) release = true;

    log('VERSION FOUND  : ' + version);
    log('NEXT VERSION   : ' + next);

    exec('mvn versions:set -DgenerateBackupPoms=false -DnewVersion=' + next);
    commitChanges(release, next, dry);
    if (!dry) pushChanges();
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

const bumpVersion = function (versionStr) {
    if (versionStr.endsWith(developmentSuffix)) {
        versionStr = versionStr.replace(developmentSuffix, '');
        // exitCode = 0;
    } else {
        let versionParts = versionStr.split('.').map((s) => parseInt(s));
        versionParts[versionParts.length - 1] = versionParts[versionParts.length - 1] + 1;
        versionStr = versionParts.join('.') + developmentSuffix;
        // exitCode = 1;
    }
    return versionStr;
}

const updateVersion = function (array = [], versionKey) {
    let exitCode = 0, nextVersion;

    const newPropsArray = array.map((obj) => {
        if (obj.key === versionKey) {
            let {value} = obj;
            nextVersion = bumpVersion(value);
            if (nextVersion.endsWith(developmentSuffix)) exitCode = 1;
            obj.value = nextVersion;
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

const readGradlePropertiesAsArray = function (file = propertiesFile) {
    const dataBefore = read(file);
    return propsToArray(dataBefore);
}

const readKeyFromGradleProperties = function (key) {
    const match = readGradlePropertiesAsArray().filter((item) => item.key === key);
    return match.length ? (match[0].value || '') : '';
}

const readJson = function (path) {
    let jsonString = read(path);
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return null;
    }
}

/**
 * This functions will update your gradle.properties file automatically,
 * in order to support side by side builds using Sencha Cmd
 *
 * @returns {{release: boolean, nextVersion}}
 */
const updateVersionInGradleProperties = function (file = propertiesFile, versionKey) {
    const arrayData = readGradlePropertiesAsArray(file);
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
    versionKeys: ['version'],
    dry: false
}) {
    if (!systemCheck()) {
        log('SORRY, SYSTEM CHECK FAILED.');
        return;
    }

    let {dry, versionKeys = []} = options;
    log('VERSION KEYS LENGTH: ' + versionKeys.length);
    if (versionKeys.length === 0) {
        log('NO VERSION KEY DEFINED');
        return;
    }
    if (dry) log('DRY RUN')

    log('UPDATING VERSION FILES....');

    versionKeys
        .map((versionKey) => {
            const {release, nextVersion} = updateVersionInGradleProperties(undefined, versionKey);
            commitChanges(release, nextVersion, dry);
        })

    log('PUSH UPPP');
    if (!dry) pushChanges();
    log('DONE.');
};

const commitChanges = function (release, nextVersion, dry) {
    const commitText = getCommitMessage(release, nextVersion);
    log('COMMITTING: ' + commitText);
    if (!dry) commitAndPushAllChanges(commitText, false);
    if (release) {
        let msg = getTagMessage(nextVersion);
        log('TAGGING: ' + msg);
        if (!dry) createTag(msg);
    }
}

module.exports = {
    updateVersionInGradleProperties,
    doRelease,
    createTag,
    commitAndPushAllChanges,
    readKeyFromGradleProperties,
    readJson,
    bumpPomXml
}