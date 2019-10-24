const { pathFromRoot } = require('../util')

module.exports = {
  govukFrontendRoot: pathFromRoot('dependencies', 'govuk-frontend'),
  designSystemRoot: pathFromRoot('dependencies', 'alphagov', 'govuk-design-system'),
  readMe: pathFromRoot('README.md'),
  substitutionMap: {
    'input': 'text-input'
  }
}
