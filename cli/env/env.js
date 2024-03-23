const {homedir} = require("node:os");
const {readFileSync} = require('fs');
const {fileExists} = require("../../utils/file/file");

/**
 * reads property file with keys like..
 *
 * host_name_key=ie BCD31293872138
 * host_name_url=URL_TO_TARGET_BPC
 *
 * and builds a object like
 * {systems:{host_name:{key,url}}}
 *
 */
const buildEnv = function () {
    const localEnvFolder = homePath();
    let env = {};
    if (fileExists(localEnvFolder)) {
        let file = readFileSync(localEnvFolder + '/keys', {encoding: 'utf-8'})
        const lines = (file || '').trim().split('\n');
        const systems = {};
        const store = lines.map((line) => {
            const [key, value] = line.split('=');
            const [hostId, systemId, prop] = key.split('_');
            const systemKey = [hostId, systemId].join('_')
            if (!systems[systemKey]) systems[systemKey] = {};
            systems[systemKey][prop] = value;
            return {key, value};
        })
        env.systems = systems;
    }
    return env;
}

const homePath = function () {
    return [homedir(), '.bpc-sdk-unofficial'].join('/');
}

module.exports = {buildEnv};
