const path = require('path')

module.exports = {
  dsComponentRoot: `${path.resolve('dependencies/alphagov/govuk-design-system/src/components')}/`,
  readMe: path.resolve('README.md'),
  substitutionMap: {
    'input': 'text-input'
  }
}
