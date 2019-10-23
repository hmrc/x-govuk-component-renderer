const nunjucks = require('../../lib/nunjucks')

const {
  getComponentIdentifier,
  getGovukFrontend
} = require('../../util')

module.exports = async (req, res) => {
  const {
    body = {},
    params: {
      version,
      component
    }
  } = req

  if (parseFloat(version) < 3) {
    res.status(500).send('This version of govuk-frontend is not supported')
  } else {
    await getGovukFrontend(version)
  
    const params = JSON.stringify(body, null, 2)
    try {
      const nunjucksString = `{% from '${getComponentIdentifier(component)}/macro.njk' import ${component} %}{{${component}(${params})}}`
      res.send(nunjucks.renderString(nunjucksString))
    } catch (err) {
      res.status(500).send(err)
    }
  }
}
