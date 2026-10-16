const express = require('express');
const YAML = require('js-yaml');
const { promisify } = require('util');

const fs = require('fs');
const readFileAsync = promisify(fs.readFile);

const bodyParser = require('body-parser');

const { versionIsCompatible } = require('../../model');

const jsonParser = bodyParser.json();

const {
  getConfiguredNunjucksForOrganisation,
  getDirectories,
  getOrgDetails,
  respondWithError,
  getDependency,
  getComponentSignature,
  renderComponent,
  excludeFromSnapshot,
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

  if (versionIsCompatible(version, orgDetails)) {
    const { srcDir, exampleData } = orgDetails.getVersionSpecifics(version);
    Promise.all([
      getConfiguredNunjucksForOrganisation(orgDetails, version),
      getDependency(`${orgDetails.label}-github`, orgDetails.githubUrl, version)
        .then((path) => {
          return getDirectories(`${path}/${srcDir}`)
            .then((directories) => Promise.all(
              directories.map((componentName) =>
                readFileAsync(`${path}/${srcDir}/${componentName}/${componentName}.yaml`, 'utf8')
                  .then((contents) => YAML.load(contents, { json: true }))
                  .then((componentInfo) => (componentInfo.type === 'layout' || excludeFromSnapshot.includes(componentName)) ? [] : componentInfo.examples)
                  .catch(() => [])
                  .then((examples) => examples.map((example) => ({
                    componentName: getComponentSignature(orgDetails.code, componentName),
                    exampleName: example.name,
                    exampleId: ensureUniqueName(`${componentName}-${example.name}`.replace(/\s/g, '-')),
                    input: exampleData(example),
                  })))
              )
            ))
            .then(flatten);
        }),
    ])
      .then(([configuredNunjucks, examples]) => examples.map((example) => ({
        ...example,
        output: renderComponent(
          orgDetails,
          version,
          example.componentName,
          example.input,
          configuredNunjucks,
        ),
      })))
      .then((out) => res.send(out))
      .catch(respondWithError(res));
  } else {
    res.status(500).send(`This version of ${(orgDetails.label)} is not supported`);
  }
});

module.exports = router;
