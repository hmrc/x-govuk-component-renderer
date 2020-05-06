const {
  getComponentIdentifier,
  getDataFromFile,
  getDependency,
  getDirectories,
  getNpmDependency,
  getLatestSha
} = require('../../util')

const {
  substitutionMap
} = require('../../constants')

const express = require('express')
const router = express.Router()

const orgs = {
  'govuk': {
    name: 'alphagov/govuk-design-system',
    componentRootPath: `src/components`,
    dependencies: ['govuk-frontend']
  },
  'hmrc': {
    name: 'hmrc/design-system',
    componentRootPath: `src/examples`,
    dependencies: ['govuk-frontend', 'hmrc-frontend']
  }
}

router.get('/:org/:component', async (req, res) => {
  const {params: {component, org}} = req
  const {componentRootPath, dependencies, name} = orgs[org]

  const componentIdentifier = getComponentIdentifier(undefined, component)

  const sha = await getLatestSha(name)
  getDependency(
    name,
    `https://github.com/${name}/tarball/${sha}`,
    sha
  ).then(dependencyPath => {


    return Promise.all(dependencies.map(dependency => {
      const packageContents = require(`${dependencyPath}/package.json`)
      const version = packageContents.dependencies[dependency]
      const trimmedVersion = version
        .replace('v', '')
        .replace('^', '')
        .replace('~', '')
      return getNpmDependency(dependency, trimmedVersion)
    })).then(subdependecyPaths => ({ dependencyPath, subdependecyPaths }))
  }).then(paths => {
    const componentPath = `${paths.dependencyPath}/${componentRootPath}/${substitutionMap[componentIdentifier] || componentIdentifier}`
    const examples = getDirectories(componentPath)
    const output = []
    examples.forEach(example => {
      output.push(getDataFromFile(`${componentPath}/${example}/index.njk`, paths.subdependecyPaths, {
        name: `${componentIdentifier}/${example}`
      }))
    })


    Promise.all(output).then(result => {
      res.send(result)
    })
  })
    .catch(err => {
      console.error(err.message)
      console.error(err.stack)
      res.status(500).send(err)
    })
})

module.exports = router