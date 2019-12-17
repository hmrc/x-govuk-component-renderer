const path = require('path')

const pathFromRoot = (...parts) => path.join(__dirname, '..', ...parts)

module.exports = {
  govukFrontendRoot: path.resolve('dependencies/govuk-frontend'),
  hmrcFrontendRoot: path.resolve('dependencies/hmrc-frontend'),
  designSystemRoot: path.resolve('dependencies/alphagov/govuk-design-system'),
  pathFromRoot,
  readMe: path.resolve('README.md'),
  substitutionMap: {
    'input': 'text-input'
  }
}