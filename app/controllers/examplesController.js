const {
  getComponentIdentifier,
  getDataFromFile,
  getDependency,
  getDirectories,
  getNpmDependency,
  getLatestSha
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
  const sha = await getLatestSha(name)
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

  await getNpmDependency('govuk-frontend', trimmedVersion)

  try {
    const examples = getDirectories(componentPath)
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