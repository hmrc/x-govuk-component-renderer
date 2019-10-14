const nunjucks = require('../../lib/nunjucks')
const {
  getComponentIdentifier,
} = require('../../util')

module.exports = (req, res) => {
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
}