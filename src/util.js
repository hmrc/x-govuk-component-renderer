const fs = require('fs')
const matter = require('gray-matter')
const {spawn} = require('child_process')
const axios = require('axios')
const http = require('https')
const tar = require('tar')

const nunjucks = require('./lib/nunjucks')

const {pathFromRoot} = require('./app/constants')

const spawnPromise = (script, args) => new Promise((resolve, reject) => {
  const process = spawn(script, args)
  process.on('close', () => {
    resolve()
  })
})

const mkdir = (path) => new Promise((res, rej) => {
  fs.mkdir(path, {recursive: true}, (err) => {
    if (err) {
      rej(err)
    } else {
      res()
    }
  })
})

const dirExistsAndNotEmpty = (path) => new Promise((res, rej) => {
  fs.readdir(path, function (err, contents) {
    if (err && err.code === 'ENOENT') {
      res(false)
    } else if (err) {
      rej(err)
    } else {
      res(contents.length > 0)
    }
  })
})

const getDependency = (name, remote, version) => {
  const path = pathFromRoot('dependencies', name, version, name)
  return dirExistsAndNotEmpty(path)
    .then(exists => {
      if (exists) {
        return path
      }
      return mkdir(path)
        .then(_ => new Promise((resolve, reject) => {
          http.get(remote, (response) => {
            const statusCode = response.statusCode;
            if (statusCode === 200) {
              response
                .on('error', (err) => reject(err))
                .pipe(tar.x(
                  {
                    strip: 1,
                    C: path
                  }
                ))
                .on('error', (err) => reject(err))
                .on('end', () => resolve(path))
            } else if (statusCode === 302) {
              getDependency(name, response.headers.location, version) // TODO: avoid infinite following
                .then(path => resolve(path))
                .catch(err => reject(err))
            } else {
              const message = `Failed to load ${path} status code was ${statusCode}`
              console.error(message)
              return reject(new Error(message))
            }
          })
        }))
    })
}

const getComponentIdentifier = (org, component) => component.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`).replace('govuk-', '').replace('hmrc-', '')

const getDirectories = source => fs.readdirSync(source, {withFileTypes: true})
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)

const getDataFromFile = (file, paths, meta) => new Promise((resolve, reject) => {
  fs.readFile(file, 'utf8', (err, contents) => {
    if (err) {
      console.error('error reading', file)
      reject(err)
    } else {
      const nj = matter(contents).content
      const html = nunjucks(paths).renderString(nj).trim()
      resolve({
        ...meta,
        html,
        nunjucks: nj.trim(),
      })
    }
  })
})

const getNpmDependency = async (dependency, version) => {
  return await getDependency(
    dependency,
    `https://registry.npmjs.org/${dependency}/-/${dependency}-${version}.tgz`,
    version
  )
}

const getLatestSha = async (repo, branch = 'master') => {
  const token = process.env.TOKEN
  const headers = token ? {headers: {Authorization: `token ${token}`}} : undefined
  const {data: {sha}} = await axios.get(`https://api.github.com/repos/${repo}/commits/${branch}`, headers)
  return sha
}

const getOrgDetails = org => ({
  'govuk': {
    label: 'govuk-frontend',
    minimumSupported: 3
  },
  'hmrc': {
    label: 'hmrc-frontend',
    dependencies: ['govuk-frontend'],
    minimumSupported: 1
  }
})[org]

const getSubDependencies = (dependencyPath, dependencies) => Promise.all(dependencies.map(dependency => {
  const packageContents = require(`${dependencyPath}/package.json`)
  const version = packageContents.dependencies[dependency]
  const trimmedVersion = version
    .replace('v', '')
    .replace('^', '')
    .replace('~', '')
  return getNpmDependency(dependency, trimmedVersion)
}))

const respondWithError = (res) => (err) => {
  if (err) {
    console.error(err.message)
    console.error(err.stack)
    res.status(500).send(err)
  } else {
    console.error('failed but no error provided')
    res.status(500).send('An error occurred')
  }
}

const joinWithCurrentUrl = req => path => `${req.originalUrl.replace(/\/+$/, '')}/${path}`

module.exports = {
  getComponentIdentifier,
  getDataFromFile,
  getDependency,
  getDirectories,
  getNpmDependency,
  getLatestSha,
  getOrgDetails,
  getSubDependencies,
  respondWithError,
  joinWithCurrentUrl
}