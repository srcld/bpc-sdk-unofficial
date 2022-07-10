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

const createSettingsFile = function (obj = {}, type = '', path = '') {
    const settingsJson = createSettingsFromPartsObject(obj);
    const settingsText = JSON.stringify(settingsJson, undefined, 4);
    fs.writeFileSync((path.length ? path : '') + 'default_' + type + '_settings.json', settingsText, 'utf-8')
}

const handleSettings = function (settings, basePath = '') {
    Object.keys(settings).map((settingsType) => {
        createSettingsFile(settings[settingsType], settingsType, basePath)
    })
}

module.exports = {createSettingsFile, handleSettings}