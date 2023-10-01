const sdk = require("../../sdk");
const {bumpPomXml} = require("../../utils/release/release");
const {isValidRepo} = require("../env/env_repo");

let log = console.log;

const handle = {
    release: function (args, isRelease) {
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
    xml: function (args, isRelease) {
        if (isValidRepo('pom.xml')) bumpPomXml();
    },
    build: function (args, isRelease) {
        sdk.buildLegacyBpcPackage();
    }
}

module.exports = {handle};