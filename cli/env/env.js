const {homedir} = require("node:os");
const {readFileSync} = require('fs');
const {fileExists} = require("../../utils/file/file");

const buildEnv = function () {
    const localEnvFolder = [homedir(), '.bpc-sdk-unofficial'].join('/');
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

module.exports = {buildEnv};
