const {
  getComponentIdentifier,
  getDataFromFile,
  getDependency,
  getDirectories,
  getNpmDependency,
  getLatestSha
} = require('../../util')

const {
  govukDesignSystemRoot,
  hmrcDesignSystemRoot,
  substitutionMap
} = require('../../constants')

const orgs = {
  'govuk': {
    name: 'alphagov/govuk-design-system',
    rootPath: govukDesignSystemRoot,
    componentRootPath: `${govukDesignSystemRoot}/src/components`,
    dependencies: ['govuk-frontend']
  },
  'hmrc': {
    name: 'hmrc/design-system',
    rootPath: hmrcDesignSystemRoot,
    componentRootPath: `${hmrcDesignSystemRoot}/src/examples`,
    dependencies: ['govuk-frontend', 'hmrc-frontend']
  }
}

module.exports = async (req, res) => {
  const { params: { component, org } } = req
  const { componentRootPath, dependencies, name, rootPath } = orgs[org]

  const componentIdentifier = getComponentIdentifier(component)
  const componentPath = `${componentRootPath}/${substitutionMap[componentIdentifier] || componentIdentifier}`

  const sha = await getLatestSha(name)
  await getDependency(
    name,
    `https://github.com/${name}/tarball/${sha}`,
    sha
  )

  for (const dependency of dependencies) {
    const version = require(`${rootPath}/package.json`).dependencies[dependency]
    const trimmedVersion = version
      .replace('v', '')
      .replace('^', '')
      .replace('~', '')
    await getNpmDependency(dependency, trimmedVersion)
  }

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