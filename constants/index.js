const path = require('path')

const pathFromRoot = (...parts) => path.join(__dirname, '..', ...parts)

module.exports = {
  govukFrontendRoot: pathFromRoot('dependencies', 'govuk-frontend'),
  designSystemRoot: pathFromRoot('dependencies', 'alphagov', 'govuk-design-system'),
  pathFromRoot,
  readMe: pathFromRoot('README.md'),
  substitutionMap: {
    'input': 'text-input'
  }
}
