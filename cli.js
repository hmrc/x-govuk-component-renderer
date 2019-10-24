#!/usr/bin/env node

const pkg = require('./package.json')
const app = require('./app')

const args = [].concat(process.argv).splice(2)
const command = args[0]
const port = args[1]

if (command !== 'start'){
  throw new Error('You must provide a valid command')
}

if (!parseInt(port)){
  throw new Error('You must provide a valid port')
}

app.listen(port, () => console.log(`Running version ${pkg.version} on port ${port}`))
