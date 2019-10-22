const path = require('path')
const axios = require('axios')

const {
  getComponentIdentifier,
  getDataFromFile,
  getDependency,
  getDirectories
} = require('../../util')

const {
  dsComponentRoot,
  substitutionMap
} = require('../../constants')

module.exports = async (req, res) => {
  const { params: { component } } = req
  const componentIdentifier = getComponentIdentifier(component)
  const componentPath = `${dsComponentRoot}${substitutionMap[componentIdentifier] || componentIdentifier}`
  
  const name = 'alphagov/govuk-design-system'
  const { data: { sha } } = await axios.get(`https://api.github.com/repos/${name}/commits/master`)
  await getDependency(
    name,
    `https://github.com/${name}/tarball/${sha}`,
    sha
  )
    
  try {
    const examples = getDirectories(path.resolve(__dirname, componentPath))
    const output = []
    examples.forEach(example => {
      output.push(getDataFromFile(`${componentPath}/${example}/index.njk`, {
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