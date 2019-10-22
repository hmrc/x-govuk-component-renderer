const nunjucks = require('../../lib/nunjucks')

const {
  getComponentIdentifier,
  getDependency
} = require('../../util')

module.exports = async (req, res) => {
  const {
    body = {},
    params: {
      version,
      component
    }
  } = req

  const trimmedVersion = version.replace('v', '')
  
  await getDependency(
    `govuk-frontend`,
    `https://registry.npmjs.org/govuk-frontend/-/govuk-frontend-${trimmedVersion}.tgz`,
    trimmedVersion
  )

  const params = JSON.stringify(body, null, 2)
  try {
    const nunjucksString = `{% from '${getComponentIdentifier(component)}/macro.njk' import ${component} %}{{${component}(${params})}}`
    res.send(nunjucks.renderString(nunjucksString))
  } catch (err) {
    res.status(500).send(err)
  }
}
