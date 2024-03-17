#!/usr/bin/env node
const {detectRepo, detectRepoVariant} = require("./cli/env/env_repo");
const {handle} = require("./cli/methods/map");
const {doLog} = require("./utils/log/sourlog");

const args = process.argv.slice(2);

const supportedArgumentNames = ['test', 'release', 'build', 'xml', 'deploy'];
const otherArgumentNames = ['modulesettings', 'instancesettings', 'beautifySettings'];

doLog('BPC SDK - unofficial');

if (!args.length) {
    doLog("Warning: No arguments");
    process.exit();
} else {
    const method = args[0];

    const supportedArgumentsMethods = supportedArgumentNames.concat(otherArgumentNames);

    if (supportedArgumentsMethods.indexOf(method) === -1) {
        doLog("Warning: Method no supported");
        process.exit();
    }

    if (handle[method]) {
        doLog(method + ' DETECTED');

        let repoType = detectRepoVariant();

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

            if(method === 'deploy') return handle[method]();

            doLog('Method wont run. Sorry. Consult the docs.')
        }
    }
}