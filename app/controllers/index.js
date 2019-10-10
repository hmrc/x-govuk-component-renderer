const fs = require('fs')
const marked = require('marked')
const path = require('path')

const nunjucks = require('../../lib/nunjucks')
const {
  getComponentIdentifier,
  getDirectories,
  getHtmlFromFile
} = require('../../util')

const {
  dsComponentRoot,
  substitutionMap
} = require('../../constants')

const rootController = (req, res) => {
  fs.readFile('../../README.md', 'utf8', (err, contents) => {
    if (err) {
      res.status(500).send('Could not display README, please check github instead.')
    } else {
      res.send(marked(contents))
    }
  })
}

const examplesController = (req, res) => {
  const { params: { component } } = req
  const componentIdentifier = getComponentIdentifier(component)
  const componentPath = `${dsComponentRoot}${substitutionMap[componentIdentifier] || componentIdentifier}`
  
  try {
    const examples = getDirectories(path.resolve(__dirname, componentPath))
    const output = []
    examples.forEach(example => {
      output.push(getHtmlFromFile(`${componentPath}/${example}/index.njk`, {
        name: `${componentIdentifier}/${example}`
      }))
    })
    
    Promise.all(output).then(result => {
      console.log(result)
      res.send(result)
    })
  } catch (err) {
    res.status(500).send(err)
  }
}

const componentController = (req, res) => {
  const {
    body = {},
    params: { component }
  } = req

  const params = JSON.stringify(body, null, 2)
  try {
    const nunjucksString = `{% from '${getComponentIdentifier(component)}/macro.njk' import ${component} %}{{${component}(${params})}}`
    res.send(nunjucks.renderString(nunjucksString))
  } catch (err) {
    res.status(500).send(err)
  }
}

module.exports = {
  rootController,
  examplesController,
  componentController
}
