const {
  getComponentIdentifier,
  getDataFromFile,
  getDependency,
  getDirectories,
  getSubDependencies,
  getLatestSha
} = require('../../util')

const {
  substitutionMap
} = require('../constants')

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

  getLatestSha(name)
    .then(sha => getDependency(
      name,
      `https://github.com/${name}/tarball/${sha}`,
      sha
    ))
    .then(dependencyPath => getSubDependencies(dependencyPath, dependencies)
      .then(subdependecyPaths => ({
        dependencyPath,
        subdependecyPaths
      }))
    )
    .then(paths => {
      const componentPath = `${paths.dependencyPath}/${componentRootPath}/${substitutionMap[componentIdentifier] || componentIdentifier}`
      const examples = getDirectories(componentPath)


      return Promise.all(
        examples.map(example => getDataFromFile(`${componentPath}/${example}/index.njk`, paths.subdependecyPaths, {
          name: `${componentIdentifier}/${example}`
        }))
      )
    })
    .then(result => {
      res.send(result)
    })
    .catch(err => {
      console.error(err.message)
      console.error(err.stack)
      res.status(500).send(err)
    })
})

module.exports = router