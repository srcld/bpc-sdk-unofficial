#!/usr/bin/env node
const sdk = require('./sdk');

const args = process.argv.slice(2);
let log = console.log;
// supported arguments
const supported = ['test', 'release'];

if (!args.length) {
    console.log("Warning: No arguments");
    process.exit();
} else {
    const method = args[0];
    let isRelease;

    if (supported.indexOf(method) === -1) {
        console.log("Warning: Method no supported");
        process.exit();
    }

    isRelease = method === 'release';

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

    console.log('Yo: ' + method);
    // TODO implement method handling

    console.log('Versions to build:');
    console.table(versionKeys);
    // process.exit();

    if (isRelease) {
        const versionsToBuild = versionKeys.length ? versionKeys : ['version'];
        sdk.release.doRelease({versionKeys: versionsToBuild, dry})
    }
}