const sdk = require('./sdk');
// const utils = require('./utils');
// super simple example
sdk.buildPackage('example', 'Example Project', {}).then(() => {
    // war only..
    // sdk.getBPCBuilder('example').clean('build-tmp')
    sdk.getBPCBuilder('example').clean('./build/example')
})

// buildInfo example
// let buildInfo = utils.getBuildInfo();
// console.log(buildInfo);

// converted grouped to sorted
// sdk.migrateSettingFile('default_module_settings.json')

// handle white space
//sdk.release.updateVersionInGradleProperties('tests/gradle.properties');

