const fs = require('fs')
const matter = require('gray-matter')
const path = require('path')
const { spawn } = require('child_process')

const md5 = require('../lib/md5')
const nunjucks = require('../lib/nunjucks')

const spawnPromise = (script, args) => new Promise((resolve, reject) => {
  const process = spawn(script, args)
  process.on('close', () => { resolve() })
})

const getDependency = async (name, remote, latest) => {
  const lookupLocalVersion = () => new Promise((res, rej) => fs.readFile(path.resolve('dependencies', name, 'version.txt'), 'utf8', (err, contents) => {
    if (err) {
      res()
    } else {
      res(contents.trim())
    }
  }))

  const version = await lookupLocalVersion()

  if (version !== latest) {
    await spawnPromise('./getDependencies.sh', [name, remote, latest])
    return
  }
}

const getComponentIdentifier = (str) => str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`).replace('govuk-', '')

const getDirectories = source => fs.readdirSync(source, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)

const getDataFromFile = (file, meta) => new Promise((resolve, reject) => {
  fs.readFile(file, 'utf8', (err, contents) => {
    if (err) {
      reject(err)
    } else {
      const nj = matter(contents).content
      const html = nunjucks.renderString(nj).trim()
      resolve({
        ...meta,
        html,
        md5: md5(html),
        nunjucks: nj.trim(),
      })
    }
  })
})

const getGovukFrontend = async (version) => {
  const trimmedVersion = version
    .replace('v', '')
    .replace('^', '')
    .replace('~', '')

  await getDependency(
    `govuk-frontend`,
    `https://registry.npmjs.org/govuk-frontend/-/govuk-frontend-${trimmedVersion}.tgz`,
    trimmedVersion
  )
}

module.exports = {
  getComponentIdentifier,
  getDataFromFile,
  getDependency,
  getDirectories,
  getGovukFrontend
}
