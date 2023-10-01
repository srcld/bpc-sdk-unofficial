#!/usr/bin/env node
const sdk = require('./sdk');
const {bumpPomXml} = require("./utils/release/release");
const {fileExists} = require("./utils/file/file");

const args = process.argv.slice(2);
let log = console.log;
// supported arguments
const supported = ['test', 'release', 'build', 'xml'];

const isValidRepo = function (fileName = '') {
    let path = './' + fileName;
    let exists = fileExists(path);
    if (!exists) log('Version file does not exist: ' + fileName);
    return exists === true;
}

const handle = {
    release: function (isRelease) {
        console.table(args);
        // process.exit();

        let dry = false;
        const versionKeys = [];
        args.forEach(function (val, index, array) {
            if ((val || '') === '--dry') {
                dry = true;
                log('DRY RUN ENABLED')
            } else {
                log('no')
                log(val);
            }
            let value = val || '';
            if (isRelease && value.length && val !== 'release' && val !== '--dry') versionKeys.push(value);
        });

        // console.log('Yo: ' + method);
        // TODO implement method handling

        console.log('Versions to build:');
        console.table(versionKeys);
        // process.exit();

        if (isRelease && isValidRepo('gradle.properties')) {
            const versionsToBuild = versionKeys.length ? versionKeys : ['version'];
            sdk.release.doRelease({versionKeys: versionsToBuild, dry})
        }
    },
    xml: function () {
        if (isValidRepo('pom.xml')) bumpPomXml();
    },
    build: function () {
        sdk.buildLegacyBpcPackage();
    }
}


if (!args.length) {
    log("Warning: No arguments");
    process.exit();
} else {
    const method = args[0];
    let isRelease;

    if (supported.indexOf(method) === -1) {
        log("Warning: Method no supported");
        process.exit();
    }

    // isRelease = method === 'release';

    if (handle[method]) {
        log(method + ' DETECTED');
        handle[method](true);
    }


}