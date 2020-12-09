const express = require('express');

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const {
  renderComponent,
  getOrgDetails,
  respondWithError,
  versionIsCompatible,
  getConfiguredNunjucksForOrganisation,
} = require('../../util');

const router = express.Router();

router.post('/:org/:version/:component', jsonParser, (req, res) => {
  const { version, org, component } = req.params;
  const orgDetails = getOrgDetails(org);

  if (!versionIsCompatible(version, orgDetails)) {
    res.status(500).send(`This version of ${(orgDetails.label)} is not supported`);
  } else {
    getConfiguredNunjucksForOrganisation(getOrgDetails(orgDetails.code), version)
      .then((nunjucks) => renderComponent(orgDetails.code, component, req.body, nunjucks))
      .then((rendered) => res.send(rendered))
      .catch(respondWithError(res));
  }
});

module.exports = router;
