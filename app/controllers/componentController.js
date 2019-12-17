const nunjucks = require('../../lib/nunjucks')

const {
  getComponentIdentifier,
  getGovukFrontend,
  getHmrcFrontend
} = require('../../util')

const orgs = {
  'govuk': {
    label: 'govuk-frontend',
    minimumSupported: 3,
    get: getGovukFrontend
  },
  'hmrc': {
    label: 'hmrc-frontend',
    minimumSupported: 1,
    get: getHmrcFrontend
  }
}

module.exports = async (req, res, org) => {
  const {
    body = {},
    params: {
      version,
      component
    }
  } = req

  const { label, minimumSupported, get } = orgs[org]

  if (parseFloat(version) < minimumSupported) {
    res.status(500).send(`This version of ${label} is not supported`)
  } else {
    await get(version)
  
    const params = JSON.stringify(body, null, 2)
    try {
      const nunjucksString = `{% from '${getComponentIdentifier(component)}/macro.njk' import ${component} %}{{${component}(${params})}}`
      res.send(nunjucks.renderString(nunjucksString))
    } catch (err) {
      res.status(500).send(err)
    }
  }
}
