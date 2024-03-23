// const fs = require("fs");
const {readFile} = require("@muzkat/grepcat/src/pusher/pusher");
const {writeFileSync, existsSync} = require("fs");

const fileExists = function (path) {
    return existsSync(path);
}

const fileToFormData = async function (filePath, fileName) {
    const body = new FormData();
    const blob = new Blob([await readFile(filePath, null)]);
    body.set("module_bundle", blob, fileName);
    return body;
}

const writeFile = function (path, data) {
    writeFileSync(path, data);
}

module.exports = {fileExists, fileToFormData, writeFile};