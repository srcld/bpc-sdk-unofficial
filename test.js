const sdk = require('./sdk');

// // super simple example
sdk.buildPackage('example', 'Example Project', {}).then(() => {
    // war only..
    // sdk.getBPCBuilder('example').clean('build-tmp')
    sdk.getBPCBuilder('example').clean('./build/example')
})

// converted grouped to sorted
// sdk.migrateSettingFile('default_module_settings.json')

// handle white space
//sdk.release.updateVersionInGradleProperties('tests/gradle.properties');