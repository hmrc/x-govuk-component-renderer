const express = require('express')
const nunjucks = require('../../lib/nunjucks')

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

const {
  getComponentIdentifier,
  getNpmDependency
} = require('../../util')


const orgs = {
  'govuk': {
    label: 'govuk-frontend',
    minimumSupported: 3
  },
  'hmrc': {
    label: 'hmrc-frontend',
    minimumSupported: 1
  }
}

module.exports = (org) => {
  const {label, minimumSupported} = orgs[org]

  const router = express.Router()
  router.post('/:version/:component', jsonParser, async (req, res) => {
    const {
      body = {},
      params: {
        version,
        component
      }
    } = req


    if (parseFloat(version) < minimumSupported) {
      res.status(500).send(`This version of ${label} is not supported`)
    } else {
      getNpmDependency(label, version).then(path => {
        const nunjucksPaths = [path, `${path}/views/layouts`]

        const params = JSON.stringify(body, null, 2)
        try {
          const nunjucksString = `{% from '${org}/components/${getComponentIdentifier(org, component)}/macro.njk' import ${component} %}{{${component}(${params})}}`
          res.send(nunjucks(nunjucksPaths).renderString(nunjucksString))
        } catch (err) {
          res.status(500).send(err)
        }
      })
    }
  })

  return router
}