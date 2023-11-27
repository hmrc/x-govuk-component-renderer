const express = require('express');
const Promise = require('bluebird');
const YAML = require('js-yaml');

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();
const fs = Promise.promisifyAll(require('fs'));

const {
  getConfiguredNunjucksForOrganisation,
  getDirectories,
  getOrgDetails,
  respondWithError,
  getDependency,
  getComponentSignature,
  renderComponent,
} = require('../../util');

const flatten = (arr) => arr.reduce((previous, current) => previous.concat(...current), []);

const uniqueNameChecker = () => {
  const usedNames = [];
  return (name) => {
    let duplicateCount = 1;
    let newName;
    if (usedNames.includes(name)) {
      do {
        duplicateCount += 1;
        newName = name + duplicateCount;
      } while (usedNames.includes(newName));
      usedNames.push(newName);
      return newName;
    }
    usedNames.push(name);
    return name;
  };
};

const router = express.Router();

router.get('/:org/:version', jsonParser, (req, res) => {
  const { version, org } = req.params;
  const orgDetails = getOrgDetails(org, version);
  const ensureUniqueName = uniqueNameChecker();

  // if (!versionIsCompatible(version, orgDetails)) {
  //   res.status(500).send(`This version of ${(orgDetails.label)} is not supported`);
  // } else {
  Promise.all([
    getConfiguredNunjucksForOrganisation(orgDetails, version),
    getDependency(`${orgDetails.label}-github`, orgDetails.githubUrl, version)
      .then((path) => getDirectories(`${path}/${orgDetails.componentDir}`)
        .map((componentName) => fs.readFileAsync(`${path}/${orgDetails.componentDir}/${componentName}/${componentName}.yaml`, 'utf8')
          .then((contents) => YAML.safeLoad(contents, { json: true }))
          .then((componentInfo) => (componentInfo.type === 'layout' ? [] : componentInfo.examples))
          .catch(() => [])
          .map((example) => ({
            componentName: getComponentSignature(orgDetails.code, componentName),
            exampleName: example.name,
            exampleId: ensureUniqueName(`${componentName}-${example.name}`.replace(/\s/g, '-')),
            input: example.options,
          })))
        .then(flatten)),
  ])
    .spread((configuredNunjucks, examples) => examples.map((example) => ({
      ...example,
      output: renderComponent(org, example.componentName, example.input, configuredNunjucks),
    })))
    .then((out) => res.send(out))
    .catch(respondWithError(res));
  // }
});

module.exports = router;
