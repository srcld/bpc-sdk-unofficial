#!/usr/bin/env node
const {handle} = require("./cli/methods/map");
const {doLog} = require("./utils/log/sourlog");
const {detectRepo} = require("./utils/repo/repo");

const args = process.argv.slice(2);

const supportedArgumentNames = ['test', 'release', 'build', 'xml', 'deploy'];
const otherArgumentNames = ['modulesettings', 'instancesettings', 'beautifySettings'];

doLog('BPC SDK - unofficial');

if (!args.length) {
    doLog("Warning: No arguments");
    process.exit();
} else {
    const method = args[0];
    const host = args[1];

    const supportedArgumentsMethods = supportedArgumentNames.concat(otherArgumentNames);

    if (supportedArgumentsMethods.indexOf(method) === -1) {
        doLog("Warning: Method no supported");
        process.exit();
    }

    if (handle[method]) {
        doLog('METHOD   : ' + method + ' DETECTED');
        doLog('HOST     : ' + host + ' DETECTED');

        let repoType = detectRepo(true);

        if (!repoType) {
            doLog('Repo not compliant');
            return;
        }

        if (detectRepo() === method) {
            doLog('nice.')
            handle[method](args);
        } else {
            if (repoType && otherArgumentNames.indexOf(method) !== -1) {
                doLog(repoType.toUpperCase() + ' found');
                handle[method](repoType);
                return;
            }

            if (method === 'deploy') return handle[method]({host});

            doLog('Method wont run. Sorry. Consult the docs.')
        }
    }
}