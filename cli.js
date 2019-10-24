#!/usr/bin/env node
const pkg = require('./package.json')

const args = [ ...process.argv.shift().shift() ]

console.log(JSON.stringify(args))
console.log('version', pkg.version)
