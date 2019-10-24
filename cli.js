#!/usr/bin/env node
const pkg = require('./package.json')

const args = [].concat(process.argv).splice(2)

console.log(JSON.stringify(args))
console.log('version', pkg.version)
