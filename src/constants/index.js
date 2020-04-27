const path = require('path')

const pathFromRoot = (...parts) => path.join(__dirname, '..', ...parts)

module.exports = {
  govukFrontendRoot: path.resolve('src/dependencies/govuk-frontend'),
  hmrcFrontendRoot: path.resolve('src/dependencies/hmrc-frontend'),
  govukDesignSystemRoot: path.resolve('src/dependencies/alphagov/govuk-design-system'),
  hmrcDesignSystemRoot: path.resolve('src/dependencies/hmrc/design-system'),
  pathFromRoot,
  readMe: path.resolve('README.md'),
  substitutionMap: {
    'input': 'text-input'
  }
}