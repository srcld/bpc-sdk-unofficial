#!/usr/bin/env node
const {detectRepo} = require("./cli/env/env_repo");
const {handle} = require("./cli/methods/map");

const args = process.argv.slice(2);
let log = console.log;

// supported arguments
const supported = ['test', 'release', 'build', 'xml'];

log('BPC SDK - unofficial');

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
        let methodDetected = detectRepo();
        if (methodDetected === method) {
            log('nice.')
            handle[method](args, true);
        } else {
            log('Method wont run. Sorry. Consult the docs.')
        }
    }
}