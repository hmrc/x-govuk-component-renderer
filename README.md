# Here’s the extensive documentation for the API:

### Environment requirements:

* [WGET](http://gnuwin32.sourceforge.net/packages/wget.htm) >= 1.19.1
* [Node](https://nodejs.org/en/) 10.15.1

## Running locally

* `npm install` will install the app dependencies
* `npm start` will run the service on port 3000 *

## Testing

* `npm test` will run the test suite *

\* _Note: If you find rate errors being triggered in the Github API you can pass in an auth token when you start the app like so: `TOKEN=<token> npm start / test`. You can generate an Auth token using your own Github account or request one from [#team-plat-ui](https://hmrcdigital.slack.com/messages/CJMUM9AG3) on HMRC Slack if you'd prefer_

## Usage

### 1.

`POST` to `/govuk/$$VERSION$$/components/$$COMPONENT_NAME$$` where `$$COMPONENT_NAME$$` is the name of the component from govuk-frontend (e.g. `govukSelect`, `govukButton`, `govukHeader`) and `$$VERSION$$` is the NPM package version (e.g. `3.0.0`, `3.1.0`), this must be 3.0.0 or greater.

The request body should contain JSON (therefore a `content-type: application/json` on the request) containing the parameters for the component.  For example:

Posting to `/govuk/3.3.0/components/govukButton` with a body of `{"text": "Save and continue"}` would return the HTML:

```
<button class="govuk-button" data-module="govuk-button">
  Save and continue
</button>
```

### 2.

`POST` to `/hmrc/$$VERSION$$/components/$$COMPONENT_NAME$$` where `$$COMPONENT_NAME$$` is the name of the component from hmrc-frontend (e.g. `hmrcPageHeading`) and `$$VERSION$$` is the NPM package version (e.g. `1.0.0`, `1.4.0`), this must be 1.0.0 or greater.

The request body should contain JSON (therefore a `content-type: application/json` on the request) containing the parameters for the component.  For example:

Posting to `/hmrc/1.4.0/components/hmrcPageHeading` with a body of `{"text": "Page heading"}` would return the HTML:

```
<header class="hmrc-page-heading">
  <h1 class="govuk-heading-xl">Page heading</h1>
</header>
```

### 3.

`GET` from `/examples-output/$$ORG$$/$$COMPONENT_NAME$$` where `$$ORG$$` is the owner of the design system (one of `hmrc` or `govuk`) and `$$COMPONENT_NAME$$` is the name of the component required e.g. `govukSelect`, `govukButton`, `hmrcAccountHeader`

The response will contain the Nunjucks and HTML output of each available example for that component.

The response structure is as follows:

`
  [
    {
      html: '<div>some markup</div>',
      name: '<component_id>/<example_id>',
      nunjucks: '{% some Nunjucks %}'
    }
  ]
`

This is currently hosted at https://template-service-spike.herokuapp.com

Limitations for the current phase:
 - We don't currently support `caller` blocks being fed in