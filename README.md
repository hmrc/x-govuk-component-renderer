Here’s the extensive documentation for the API:

`POST` to `/govuk/v3.2.0/components/$$COMPONENT_NAME$$` where `$$COMPONENT_NAME$$` is the name of the component from govuk-frontend e.g. `govukSelect`, `govukButton`, `govukHeader`

The request body should contain JSON (therefore a `content-type: application/json` on the request) containing the parameters for the component.  For example:

Posting to `/govuk/v3.2.0/components/govukButton` with a body of `{"text": "Save and continue"}` would return the HTML:

```
<button class="govuk-button" data-module="govuk-button">
  Save and continue
</button>
```

This is currently hosted at https://template-service-spike.herokuapp.com

Limitations for the current phase:
 - Only version 3.3.0 of govuk-frontend is supported, supporting a different version is easy but supporting multiple versions simultaniously would require some work
 - We don't currently support `caller` blocks being fed in