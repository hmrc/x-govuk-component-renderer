const express = require('express')
const nunjucks = require('../../lib/nunjucks')

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

const {
  getNpmDependency,
  getOrgDetails
} = require('../../util')

const router = express.Router()

const prepareVariable = variable => typeof variable === "object" ? JSON.stringify(variable) : variable


router.post('/:org/:version/:template', jsonParser, async (req, res) => {
  const {
    body = {},
    params: {
      version,
      template,
      org
    }
  } = req
  const {label, minimumSupported} = getOrgDetails(org)

  if (org !== 'govuk' || template !== 'default') {
    res.status(400).send('Currently only "govuk" and the "default" template is supported')
    return
  }

  if (parseFloat(version) < minimumSupported) {
    res.status(500).send(`This version of ${label} is not supported`)
    return
  } else {
    getNpmDependency(label, version).then(path => {
      const nunjucksPaths = [`${path}/govuk`]
      const variables = Object.keys(body.variables || {}).map(key => `{% set ${key}=${JSON.stringify(body.variables[key])} %}`)
      const blocks = Object.keys(body.blocks || {}).map(key => `{% block ${key} %}${body.blocks[key]}{% endblock %}`)
      const nunjucksString = `${[...variables, ...blocks].join('\n')} {% extends "template.njk" %}`

      try {
        res.send(nunjucks(nunjucksPaths).renderString(nunjucksString))
      } catch (err) {
        console.error(err.message)
        console.error(err.stack)
        console.info('template was:', nunjucksString)
        res.status(500).send(`An error occurred: ${err.message}`)
      }
    })
  }
})

module.exports = router