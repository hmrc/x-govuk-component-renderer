const express = require('express');

const bodyParser = require('body-parser');

const { versionIsCompatible } = require('../../model');

const jsonParser = bodyParser.json();

const {
  renderComponent,
  getOrgDetails,
  respondWithError,
  getConfiguredNunjucksForOrganisation,
} = require('../../util');

const router = express.Router();

router.post('/:org/:version/:component', jsonParser, (req, res) => {
  const { version, org, component } = req.params;
  const orgDetails = getOrgDetails(org);

  if (versionIsCompatible(version, orgDetails)) {
    getConfiguredNunjucksForOrganisation(orgDetails, version)
      .then((nunjucks) => renderComponent(orgDetails, version, component, req.body, nunjucks))
      .then((rendered) => res.send(rendered))
      .catch(respondWithError(res));
  } else {
    res.status(500).send(`This version of ${(orgDetails.label)} is not supported`);
  }
});

module.exports = router;
