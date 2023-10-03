const logLevel = {
    info: {
        aliases: ['i']
    },
    error: {
        aliases: ['e']
    },
    debug: {
        aliases: ['d']
    }
}

// TODO improve and add table

const log = console.log;

const partsDelimiter = ' - ';
const defaultLevel = 'info';

const obtainLevel = function (levelOrAlias) {
    const levels = Object.keys(logLevel);
    if (levels.indexOf(levelOrAlias) !== -1) return levelOrAlias;
    const aliasLevels = levels.filter((level) => {
        let {aliases = []} = logLevel[level];
        return aliases.indexOf(levelOrAlias) !== -1
    })
    return aliasLevels.length ? aliasLevels[0] : defaultLevel;
}

const doLog = function (msg = '', level = defaultLevel, data = undefined) {
    let isoDate = new Date().toISOString();
    level = obtainLevel(level).toUpperCase();
    log([isoDate, level, msg].join(partsDelimiter));
}

module.exports = {doLog};

