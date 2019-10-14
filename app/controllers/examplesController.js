const path = require('path')

const {
  getComponentIdentifier,
  getDirectories,
  getHtmlFromFile
} = require('../../util')

const {
  dsComponentRoot,
  substitutionMap
} = require('../../constants')

module.exports = (req, res) => {
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
     res.send(result)
   })
  } catch (err) {
    res.status(500).send(err)
  }
}