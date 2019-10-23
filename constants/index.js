const path = require('path')

module.exports = {
  govukFrontendRoot: path.resolve('dependencies/govuk-frontend'),
  designSystemRoot: path.resolve('dependencies/alphagov/govuk-design-system'),
  readMe: path.resolve('README.md'),
  substitutionMap: {
    'input': 'text-input'
  }
}
