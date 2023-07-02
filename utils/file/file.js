const fs = require("fs");

const fileExists = function (path){
    return fs.existsSync(path);
}

module.exports = {fileExists};