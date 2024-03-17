const sdk = require("../../sdk");
const {bumpPomXml} = require("../../utils/release/release");
const {doLog} = require("../../utils/log/sourlog");
const {fileExists} = require("../../utils/file/file");
const {readSettingsFile} = require("../../sdk");
const {getModuleName} = require("../../utils/repo/repo");
const {detectRepoVariant} = require("../env/env_repo"),
    {writeFileSync} = require('fs');
const {readFile} = require("@muzkat/grepcat/src/pusher/pusher");

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
    },
    beautifySettings: function () {
        let variant = detectRepoVariant();
        if (variant) {
            let tr = this.modulesettings(variant);
            let tr1 = this.instancesettings(variant);
            doLog(tr.length);
            doLog(tr1.length);
            doLog('----')
            const keysToAdd = combineIf(tr, tr1);
            doLog(keysToAdd.length);
            keysToAdd.map((key) => {
                let row = '"' + [key, key].join('":"') + '",';
                console.log(row)
            })
            // console.table(keysToAdd);
        }
    },
    modulesettings: function (repoType = '') {
        doLog('modulesettings reached');
        let map = {
            be: 'src/main/resources/defaults/default_module_settings.json',
            fe: undefined
        }
        let filePath = map[repoType.toLowerCase()];
        return settingsHandler(filePath);
    },
    instancesettings: function (repoType = '') {
        doLog('instancesettings reached');
        let map = {
            be: 'src/main/resources/defaults/default_instance_settings.json',
            fe: undefined
        }
        let filePath = map[repoType.toLowerCase()];
        return settingsHandler(filePath);
    }
}

const beautifySetting = function (setting = {}, moduleName) {
    let keys = ['label', 'tooltip'],
        newTranslations = [];

    keys.map((keyToAdd) => {
        let propertyName = '_' + keyToAdd;
        let {name} = setting;
        if (!setting[propertyName]) {
            doLog('no ' + keyToAdd + ' for: ' + name);
            let label = [moduleName, keyToAdd, name].join('_').toUpperCase();
            newTranslations.push(label);
            setting[propertyName] = label;
        }
    })

    return newTranslations;
}

const combineIf = function (src, addMayBe) {
    return src.concat(addMayBe.filter((trKey) => src.indexOf(trKey) === -1));
}

const settingsHandler = function (filePath) {
    let newTranslations = [];
    if (filePath && fileExists(filePath)) {
        doLog('settings file found');
        let json = readSettingsFile(filePath);
        // console.debug(JSON.stringify(json, undefined, 4));
        let groups = Object.keys(json);
        let moduleName = getModuleName();
        groups.map((group) => {
            let settingsGroup = json[group] || {};
            let {settings} = settingsGroup;
            settings.map((setting) => {
                let translations = beautifySetting(setting, moduleName);
                newTranslations = combineIf(newTranslations, translations)
            })
        })
        if (newTranslations.length) {
            doLog('new keys added');
            console.table(newTranslations);
            console.debug(JSON.stringify(json, undefined, 4));
            writeFileSync(filePath, JSON.stringify(json, undefined, 4));

        } else {
            doLog('nothing to do....');
        }
    }
    return newTranslations;
}

module.exports = {handle};