#!/usr/bin/env node
const {detectRepo} = require("./cli/env/env_repo");
const {handle} = require("./cli/methods/map");

const args = process.argv.slice(2);
let log = console.log;

const supportedArgumentNames = ['test', 'release', 'build', 'xml'];

log('BPC SDK - unofficial');

if (!args.length) {
    log("Warning: No arguments");
    process.exit();
} else {
    const method = args[0];

    if (supportedArgumentNames.indexOf(method) === -1) {
        log("Warning: Method no supported");
        process.exit();
    }

    if (handle[method]) {
        log(method + ' DETECTED');
        if (detectRepo() === method) {
            log('nice.')
            handle[method](args);
        } else {
            log('Method wont run. Sorry. Consult the docs.')
        }
    }
}