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

const router = express.Router()

router.post('/:org/:version/:component', jsonParser, async (req, res) => {
  const {
    body = {},
    params: {
      version,
      component,
      org
    }
  } = req
  const {label, minimumSupported} = orgs[org]


  if (parseFloat(version) < minimumSupported) {
    res.status(500).send(`This version of ${label} is not supported`)
  } else {
    getNpmDependency(label, version).then(path => {
      const nunjucksPaths = [path, `${path}/views/layouts`]
      const params = JSON.stringify(body, null, 2)
      const nunjucksString = `{% from '${org}/components/${getComponentIdentifier(org, component)}/macro.njk' import ${component} %}{{${component}(${params})}}`

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