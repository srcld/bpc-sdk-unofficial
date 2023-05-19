#!/usr/bin/env node

const args = process.argv.slice(2);

// supported arguments
const supported = ['test', 'release'];

if (!args.length) {
    console.log("Warning: No arguments");
    process.exit();
} else {
    const method = args[0];
    if (supported.indexOf(method) === -1) {
        console.log("Warning: Method no supported");
        process.exit();
    }
    console.log('Yo: ' + method);
    // TODO implement method handling
}