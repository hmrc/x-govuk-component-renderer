const express = require('express')
const bodyParser = require('body-parser')
const nunjucks = require('nunjucks')
const matter = require('gray-matter')
const marked = require('marked')
const fs = require('fs')
const path = require('path')

const md5 = require('./md5')

const app = express()
const router = express.Router()

const jsonParser = bodyParser.json()

nunjucks.configure([
  'node_modules/govuk-frontend',
  'node_modules/govuk-frontend/govuk/components'
], {
  autoescape: true, // output with dangerous characters are escaped automatically
  noCache: true, // never use a cache and recompile templates each time
  trimBlocks: true, // automatically remove trailing newlines from a block/tag
  lstripBlocks: true, // automatically remove leading whitespace from a block/tag
})

const dsComponentRoot = 'dependencies/govuk-design-system/src/components/'
const substitutionMap = {
  'input': 'text-input'
}

const getDirectories = source => fs.readdirSync(source, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)

const getComponentIdentifier = (str) => str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`).replace('govuk-', '')

function getHtmlFromFile(file, meta) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, contents) => {
      if (err) {
        reject(err)
      } else {
        const raw = matter(contents).content
        const html = nunjucks.renderString(raw).trim()
        resolve({
          ...meta,
          html,
          md5: md5(html)
        })
      }
    })
  })
}

router.get('/', (req, res) => {
  fs.readFile('./README.md', 'utf8', (err, contents) => {
    if (err) {
      res.status(500).send('Could not display README, please check github instead.')
    } else {
      res.send(marked(contents))
    }
  })
})

router.get('/examples-output/:component', (req, res) => {
  const { params: { component } } = req
  const componentIdentifier = getComponentIdentifier(component)
  const componentPath = `${dsComponentRoot}${substitutionMap[componentIdentifier] || componentIdentifier}`
  
  try {
    const examples = getDirectories(path.resolve(__dirname, componentPath))
    const output = []
    examples.forEach(example => {
      output.push(getHtmlFromFile(`${componentPath}/${example}/index.njk`, {
        name: `${componentIdentifier}/${example}`
      }))
    })
    
    Promise.all(output).then(result => {
      console.log(result)
      res.send(result)
    })
  } catch (err) {
    res.status(500).send(err)
  }
})

router.post('/govuk/v3.3.0/components/:component', jsonParser, (req, res) => {
  const {
    body = {},
    params: { component }
  } = req

  const params = JSON.stringify(body, null, 2)
  try {
    const nunjucksString = `{% from '${getComponentIdentifier(component)}/macro.njk' import ${component} %}{{${component}(${params})}}`
    res.send(nunjucks.renderString(nunjucksString))
  } catch (err) {
    res.status(500).send(err)
  }
})

app.use(router)

module.exports = app