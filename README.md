## Here’s the extensive documentation for the API:

### 1.

`POST` to `/govuk/$$VERSION$$/components/$$COMPONENT_NAME$$` where `$$COMPONENT_NAME$$` is the name of the component from govuk-frontend e.g. `govukSelect`, `govukButton`, `govukHeader`

The request body should contain JSON (therefore a `content-type: application/json` on the request) containing the parameters for the component.  For example:

Posting to `/govuk/v3.3.0/components/govukButton` with a body of `{"text": "Save and continue"}` would return the HTML:

```
<button class="govuk-button" data-module="govuk-button">
  Save and continue
</button>
```

### 2.

`GET` from `/examples-output/$$COMPONENT_NAME$$` where `$$COMPONENT_NAME$$` is the name of the component from govuk-frontend e.g. `govukSelect`, `govukButton`, `govukHeader`

The response will contain the HTML output of each available example for that component along with an MD5 hash of the HTML.

The response structure is as follows:

`
  [
    {
      html: '<div>some markup</div>',
      md5: '<an_md5_hash>',
      name: '<component_id>/<example_id>',
      nunjucks: '{% some Nunjucks %}'
    }
  ]
`

This is currently hosted at https://template-service-spike.herokuapp.com

Limitations for the current phase:
 - We don't currently support `caller` blocks being fed in