const nunjucks = require('nunjucks')

const {
  govukDesignSystemRoot,
  govukFrontendRoot,
  hmrcDesignSystemRoot,
  hmrcFrontendRoot
} = require('../constants')

const configured = (paths = []) => nunjucks.configure([
  `${govukFrontendRoot}`,
  `${hmrcFrontendRoot}`,
  `${hmrcDesignSystemRoot}/lib/template-hacks`,
  `${govukDesignSystemRoot}/views/layouts`,
  ...paths
], {
  autoescape: true, // output with dangerous characters are escaped automatically
  noCache: true, // never use a cache and recompile templates each time
  trimBlocks: true, // automatically remove trailing newlines from a block/tag
  lstripBlocks: true, // automatically remove leading whitespace from a block/tag
})

  module.exports = configured