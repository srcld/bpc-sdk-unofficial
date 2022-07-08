// USED TO CREATE THE BUILD DESCRIPTOR
// FOR NEXTJS-TOOLS

// for now,
// we assert the defaults from ExtJS
const buildFileBase = {
    srcDir: 'src',
    packagesDir: 'packages'
};

const packageBase = {
    srcDir: 'src',
    resDir: 'resources'
}

const getBuildFile = (name = '') => {
    const packageBaseFile = {};
    packageBaseFile[name] = Object.assign({}, packageBase);
    const p = Object.assign({}, packageBaseFile);
    let buildFile = Object.assign({}, buildFileBase);
    buildFile['packages'] = p;
    return buildFile;
}

module.exports = {getBuildFile}