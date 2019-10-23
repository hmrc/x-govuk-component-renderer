const path = require('path')
const axios = require('axios')

const {
  getComponentIdentifier,
  getDataFromFile,
  getDependency,
  getDirectories,
  getGovukFrontend
} = require('../../util')

const {
  designSystemRoot,
  substitutionMap
} = require('../../constants')

module.exports = async (req, res) => {
  const { params: { component } } = req
  const componentIdentifier = getComponentIdentifier(component)
  const componentPath = `${designSystemRoot}/src/components/${substitutionMap[componentIdentifier] || componentIdentifier}`
  
  const name = 'alphagov/govuk-design-system'
  const { data: { sha } } = await axios.get(`https://api.github.com/repos/${name}/commits/master`)
  await getDependency(
    name,
    `https://github.com/${name}/tarball/${sha}`,
    sha
  )

  const govukFrontendVersion = require(`${designSystemRoot}/package.json`).dependencies['govuk-frontend']
  // TODO:
  // this is fragile as it will be broken by a version range or any other npm semver
  // operator such as >, <= etc...
  const trimmedVersion = govukFrontendVersion
    .replace('v', '')
    .replace('^', '')
    .replace('~', '')

  await getGovukFrontend(trimmedVersion)

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