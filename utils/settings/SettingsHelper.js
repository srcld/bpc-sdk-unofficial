const baseSettings = require('./baseSettings'),
    fs = require('fs')

const createSettingsFromPartsObject = function (settingParts = {}) {
    const final = {};
    Object.keys(settingParts).map((partName) => {
        let part = {};
        const partConfig = settingParts[partName];
        partConfig.map((setting) => {
            const key = setting.key;
            delete setting.key;
            const merged = Object.assign(setting, baseSettings);
            let obj = {};
            obj[key] = merged;
            return obj;
        }).map((obj) => {
            Object.assign(part, obj);
        })
        const finalPart = {}
        finalPart[partName] = part;
        Object.assign(final, finalPart);
    })
    return final;
}

const writeFile = function (path, data, options = 'utf-8') {
    return fs.writeFileSync(path, data, options)
}

const readFile = function (path, options = 'utf-8') {
    return fs.readFileSync(path, options);
}

const createSettingsFile = function (obj = {}, type = '', path = '') {
    const settingsJson = createSettingsFromPartsObject(obj);
    const settingsText = JSON.stringify(settingsJson, undefined, 4);
    writeFile((path.length ? path : '') + 'default_' + type + '_settings.json', settingsText);
}

const readSettingsFile = function (path) {
    return JSON.parse(readFile(path));
}

const groupedToSortedJson = function (grouped = {}) {
    const sorted = {};
    const groups = Object.keys(grouped);
    groups.map((name, i) => {
        const settings = [];
        const existingGroup = grouped[name];
        Object.keys(existingGroup).map((settingName) => {
            let newSetting = Object.assign({}, (existingGroup[settingName] || {}));
            newSetting.name = settingName;
            settings.push(newSetting);
        })
        sorted[name] = {settings, sortPriority: i + 1};
    })
    return sorted;
}

const migrateSettingFile = function (path, type = 'grouped') {
    let json = readSettingsFile(path);
    json = groupedToSortedJson(json);
    writeFile(path, JSON.stringify(json, undefined, 4));
}

const handleSettings = function (settings, basePath = '') {
    Object.keys(settings).map((settingsType) => {
        createSettingsFile(settings[settingsType], settingsType, basePath)
    })
}

module.exports = {createSettingsFile, handleSettings, readSettingsFile, groupedToSortedJson, migrateSettingFile}