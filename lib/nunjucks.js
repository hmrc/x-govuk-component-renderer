const nunjucks = require('nunjucks')

const {
  hmrcDesignSystemRoot,
  govukFrontendRoot,
  hmrcFrontendRoot
} = require('../constants')

nunjucks.configure([
    `${govukFrontendRoot}`,
    `${hmrcFrontendRoot}`,
    `${govukFrontendRoot}/govuk/components`,
    `${hmrcFrontendRoot}/hmrc/components`,
    `${govukDesignSystemRoot}/views/layouts`,
    `${hmrcDesignSystemRoot}/lib/template-hacks`
  ], {
    autoescape: true, // output with dangerous characters are escaped automatically
    noCache: true, // never use a cache and recompile templates each time
    trimBlocks: true, // automatically remove trailing newlines from a block/tag
    lstripBlocks: true, // automatically remove leading whitespace from a block/tag
  })

  module.exports = nunjucks
