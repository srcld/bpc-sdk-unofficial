const baseSettings = require('./baseSettings'),
    fs = require('fs');

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

const createSettingsFile = function (obj = {}, type = '') {
    const settingsJson = createSettingsFromPartsObject(obj);
    const settingsText = JSON.stringify(settingsJson, undefined, 4);
    fs.writeFileSync('default_' + type + '_settings.json', settingsText, 'utf-8')
}

module.exports = {createSettingsFile}