const fs = require('fs')
const matter = require('gray-matter')
const { spawn } = require('child_process')
const axios = require('axios')

const md5 = require('../lib/md5')
const nunjucks = require('../lib/nunjucks')

const { pathFromRoot } = require('../constants')

const spawnPromise = (script, args) => new Promise((resolve, reject) => {
  const process = spawn(script, args)
  process.on('close', () => { resolve() })
})

const getDependency = async (name, remote, latest) => {
  const lookupLocalVersion = () => new Promise((res, rej) => fs.readFile(pathFromRoot('dependencies', name, 'version.txt'), 'utf8', (err, contents) => {
    if (err) {
      res()
    } else {
      res(contents.trim())
    }
  }))

  const version = await lookupLocalVersion()

  if (version !== latest) {
    await spawnPromise(pathFromRoot('getDependencies.sh'), [name, remote, latest, pathFromRoot()])
  }
}

const getComponentIdentifier = (str) => str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`).replace('govuk-', '').replace('hmrc-', '')

const getDirectories = source => fs.readdirSync(source, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)

const getDataFromFile = (file, meta) => new Promise((resolve, reject) => {
  fs.readFile(file, 'utf8', (err, contents) => {
    if (err) {
      reject(err)
    } else {
      const nj = matter(contents).content
      const html = nunjucks().renderString(nj).trim()
      resolve({
        ...meta,
        html,
        md5: md5(html),
        nunjucks: nj.trim(),
      })
    }
  })
})

const getNpmDependency = async (dependency, version) => {
  await getDependency(
    dependency,
    `https://registry.npmjs.org/${dependency}/-/${dependency}-${version}.tgz`,
    version
  )
}

const getLatestSha = async (repo, branch = 'master') => {
  const token = process.env.TOKEN
  const headers = token ? { headers: { Authorization: `token ${token}` } } : undefined
  const { data: { sha } } = await axios.get(`https://api.github.com/repos/${repo}/commits/${branch}`, headers)
  return sha
}

module.exports = {
  getComponentIdentifier,
  getDataFromFile,
  getDependency,
  getDirectories,
  getNpmDependency,
  getLatestSha
}