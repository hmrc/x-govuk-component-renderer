const express = require('express')
const bodyParser = require('body-parser')
const nunjucks = require('nunjucks')
const marked = require('marked')
const fs = require('fs')

const app = express()
const router = express.Router()

const jsonParser = bodyParser.json()

const getComponentPath = (str) => str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`).replace('govuk-', '')

nunjucks.configure(['node_modules/govuk-frontend/govuk/components'], {
  autoescape: true, // output with dangerous characters are escaped automatically
  noCache: true, // never use a cache and recompile templates each time
  trimBlocks: true, // automatically remove trailing newlines from a block/tag
  lstripBlocks: true, // automatically remove leading whitespace from a block/tag
})

router.get('/', (req, res) => {
  fs.readFile('./README.md', 'utf8', (err, contents) => {
    if (err) {
      res.status(500).send('Could not display README, please check github instead.')
    } else {
      res.send(marked(contents))
    }
  })
})

router.post('/govuk/v3.3.0/components/:component', jsonParser, (req, res) => {
  const {
    body = {},
    params: { component }
  } = req

  const params = JSON.stringify(body, null, 2)
  try {
    const nunjucksString = `{% from '${getComponentPath(component)}/macro.njk' import ${component} %}{{${component}(${params})}}`
    res.send(nunjucks.renderString(nunjucksString))
  } catch (err) {
    res.status(500).send(err)
  }
})

app.use(router)

module.exports = app
