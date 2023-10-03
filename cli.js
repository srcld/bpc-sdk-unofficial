#!/usr/bin/env node
const {detectRepo} = require("./cli/env/env_repo");
const {handle} = require("./cli/methods/map");
const {doLog} = require("./utils/log/sourlog");

const args = process.argv.slice(2);

const supportedArgumentNames = ['test', 'release', 'build', 'xml'];

doLog('BPC SDK - unofficial');

if (!args.length) {
    doLog("Warning: No arguments");
    process.exit();
} else {
    const method = args[0];

    if (supportedArgumentNames.indexOf(method) === -1) {
        doLog("Warning: Method no supported");
        process.exit();
    }

    if (handle[method]) {
        doLog(method + ' DETECTED');
        if (detectRepo() === method) {
            doLog('nice.')
            handle[method](args);
        } else {
            doLog('Method wont run. Sorry. Consult the docs.')
        }
    }
}