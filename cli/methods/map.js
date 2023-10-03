const sdk = require("../../sdk");
const {bumpPomXml} = require("../../utils/release/release");
const {doLog} = require("../../utils/log/sourlog");

let {table} = console;

let props = {
    dry: '--dry'
}

// TODO extract dry run

const handle = {
    release: function (args) {
        table(args);

        let dry = false;
        const versionKeys = [];
        args.forEach(function (val, index, array) {
            if ((val || '') === props.dry) {
                dry = true;
                doLog('DRY RUN ENABLED')
            }
            let value = val || '';
            if (value.length && val !== 'release' && val !== props.dry) versionKeys.push(value);
        });

        doLog('Versions to build:');
        table(versionKeys);

        const versionsToBuild = versionKeys.length ? versionKeys : ['version'];
        sdk.release.doRelease({versionKeys: versionsToBuild, dry})
    },
    xml: function (args) {
        bumpPomXml();
    },
    build: function (args) {
        sdk.buildLegacyBpcPackage();
    }
}

module.exports = {handle};