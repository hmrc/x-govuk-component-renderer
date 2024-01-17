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

`POST` to `/component/govuk/$$VERSION$$/$$COMPONENT_NAME$$` where `$$COMPONENT_NAME$$` is the name of the component from govuk-frontend (e.g. `govukSelect`, `govukButton`, `govukHeader`) and `$$VERSION$$` is the NPM package version (e.g. `3.0.0`, `3.1.0`), this must be 3.0.0 or greater.

The request body should contain JSON (therefore a `content-type: application/json` on the request) containing the parameters for the component.  For example:

Posting to `/component/govuk/3.3.0/govukButton` with a body of `{"text": "Save and continue"}` would return the HTML:

```
<button class="govuk-button" data-module="govuk-button">
  Save and continue
</button>
```

### 2.

`POST` to `/component/hmrc/$$VERSION$$/$$COMPONENT_NAME$$` where `$$COMPONENT_NAME$$` is the name of the component from hmrc-frontend (e.g. `hmrcPageHeading`) and `$$VERSION$$` is the NPM package version (e.g. `1.0.0`, `1.4.0`), this must be 1.0.0 or greater.

The request body should contain JSON (therefore a `content-type: application/json` on the request) containing the parameters for the component.  For example:

Posting to `/component/hmrc/1.4.0/hmrcPageHeading` with a body of `{"text": "Page heading"}` would return the HTML:

```
<header class="hmrc-page-heading">
  <h1 class="govuk-heading-xl">Page heading</h1>
</header>
```

### 3.

`GET` from `/example-usage/$$ORG$$/$$COMPONENT_NAME$$` where `$$ORG$$` is the owner of the design system (one of `hmrc` or `govuk`) and `$$COMPONENT_NAME$$` is the name of the component required e.g. `govukSelect`, `govukButton`, `hmrcAccountHeader`

The response will contain the Nunjucks and HTML output of each available example from the design system for that component.

The response structure is as follows:

```
  [
    {
      html: '<div>some markup</div>',
      name: '<component_id>/<example_id>',
      nunjucks: '{% some Nunjucks %}'
    }
  ]
```

### 4.

`GET` from `/snapshot/$$ORG$$/$$VERSION$$` where `$$ORG$$` is the owner of the design system (one of `hmrc` or `govuk`) and `$$VERSION$$` is the NPM package version (e.g. `1.0.0`, `1.4.0`)

The response will contain the component name, a unique ID, the input params and HTML output of each available example for that component in the github project.

The response structure is as follows:

```
  [
    {
      "componentName": "govukButton",
      "exampleName": "start link",
      "exampleId": "button-start-link",
      "input": {
        "text": "Start now link button",
        "href": "/",
        "isStartButton": true
      },
      "output": "<a href=\"/\" role=\"button\" draggable=\"false\" class=\"govuk-button govuk-button--start\" data-module=\"govuk-button\">\n  Start now link button\n  <svg class=\"govuk-button__start-icon\" xmlns=\"http://www.w3.org/2000/svg\" width=\"17.5\" height=\"19\" viewBox=\"0 0 33 40\" aria-hidden=\"true\" focusable=\"false\">\n    <path fill=\"currentColor\" d=\"M0 0h13l20 20-20 20H0l20-20z\"/>\n  </svg>\n</a>"
    }
  ]
```

Limitations for the current phase:
 - We don't currently support `caller` blocks being fed in