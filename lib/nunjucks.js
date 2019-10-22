const nunjucks = require('nunjucks')

nunjucks.configure([
    'dependencies/govuk-frontend',
    'dependencies/govuk-frontend/govuk/components',
    'dependencies/alphagov/govuk-design-system/views/layouts'
  ], {
    autoescape: true, // output with dangerous characters are escaped automatically
    noCache: true, // never use a cache and recompile templates each time
    trimBlocks: true, // automatically remove trailing newlines from a block/tag
    lstripBlocks: true, // automatically remove leading whitespace from a block/tag
  })

  module.exports = nunjucks