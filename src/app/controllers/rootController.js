const fs = require('fs')
const marked = require('marked')

const { readMe } = require('../../constants')

module.exports = (req, res) => {
  fs.readFile(readMe, 'utf8', (err, contents) => {
    if (err) {
      res.status(500).send('Could not display README, please check github instead.')
    } else {
      res.send(marked(contents))
    }
  })
}