const path = require('path')

module.exports = {
  dsComponentRoot: `${path.resolve('dependencies/govuk-design-system/src/components')}/`,
  substitutionMap: {
    'input': 'text-input'
  }
}
