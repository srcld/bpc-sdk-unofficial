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

const doLog = function (msg = '', level = defaultLevel, data = undefined) {
    let isoDate = new Date().toISOString();
    level = (level || defaultLevel).toUpperCase();
    log([isoDate, level, msg].join(partsDelimiter));
}

module.exports = {doLog};

