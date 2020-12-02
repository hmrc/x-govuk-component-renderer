const express = require('express');
const path = require('path');
const {
  getComponentIdentifier,
  getDataFromFile,
  getDependency,
  getDirectories,
  getSubDependencies,
  getLatestSha,
  respondWithError,
  joinWithCurrentUrl,
} = require('../../util');

const {
  substitutionMap,
} = require('../constants');

const router = express.Router();

const orgs = {
  govuk: {
    name: 'alphagov/govuk-design-system',
    componentRootPath: 'src/components',
    nunjucksPaths: ['views/layouts'],
    dependencies: ['govuk-frontend'],
  },
  hmrc: {
    name: 'hmrc/design-system',
    componentRootPath: 'src/examples',
    nunjucksPaths: ['lib/template-hacks'],
    dependencies: ['govuk-frontend', 'hmrc-frontend'],
  },
};

const getLatestExamples = (name) => getLatestSha(name)
  .then((sha) => getDependency(
    name,
    `https://github.com/${name}/tarball/${sha}`,
    sha,
  ));

router.get('/', (req, res) => {
  res.send(Object.keys(orgs).map((orgName) => joinWithCurrentUrl(req, orgName)));
});

router.get('/:org', (req, res) => {
  const { componentRootPath, name } = orgs[req.params.org];
  getLatestExamples(name)
    .then((examplePath) => getDirectories(`${examplePath}/${componentRootPath}`))
    .then((dirs) => {
      res.send(dirs.map((dir) => joinWithCurrentUrl(req, dir)));
    })
    .catch(respondWithError(res));
});

router.get('/:org/:component', (req, res) => {
  const { params: { component, org } } = req;
  const {
    componentRootPath, dependencies, name, nunjucksPaths,
  } = orgs[org];

  const componentIdentifier = getComponentIdentifier(undefined, component);

  getLatestExamples(name)
    .then((dependencyPath) => getSubDependencies(dependencyPath, dependencies)
      .then((subdependecyPaths) => ({
        dependencyPath,
        subdependecyPaths: [
          ...subdependecyPaths,
          ...nunjucksPaths.map((x) => path.join(dependencyPath, x))],
      })))
    .then((paths) => {
      const componentPath = `${paths.dependencyPath}/${componentRootPath}/${substitutionMap[componentIdentifier] || componentIdentifier}`;

      return getDirectories(componentPath)
        .map((example) => getDataFromFile(`${componentPath}/${example}/index.njk`, paths.subdependecyPaths).catch((err) => {
          const preparedMessage = `This example couldn't be prepared - ${err.message}`;
          return {
            html: preparedMessage,
            nunjucks: preparedMessage,
          };
        })
          .then((htmlAndNunjucks) => ({ name: `${componentIdentifier}/${example}`, ...htmlAndNunjucks })));
    })
    .then((result) => {
      res.send(result);
    })
    .catch(respondWithError(res));
});

module.exports = router;
