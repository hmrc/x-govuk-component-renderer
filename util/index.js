const fs = require('fs')
const matter = require('gray-matter')

const md5 = require('../lib/md5')
const nunjucks = require('../lib/nunjucks')

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

module.exports = {
    getComponentIdentifier,
    getDataFromFile,
    getDirectories
}
