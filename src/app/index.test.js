const request = require("supertest")
const fs = require('fs')
const marked = require('marked')

const { readMe } = require('../constants')

const app = require("./")

expectHtmlToMatch = (expected, actual) => {
  const normalise = str => str.replace(/\s+/g, "\n").trim()
  expect(normalise(expected)).toBe(normalise(actual))
}

describe("Templates as a service... again!", () => {

  describe('/hmrc/:version/components/:component', () => {
    it("should return 500 and an error if the version requested is older than 1.0.0", () => {
      return request(app)
        .post("/hmrc/0.1.2/components/hmrcPageHeading")
        .send({ text: "Page heading from an unsupported version" })
        .expect(500)
        .then(response => {
          expect(response.text).toBe('This version of hmrc-frontend is not supported')
        })
    })

    it("should return a hmrc page heading", () => {
      const expected = `<header class="hmrc-page-heading">
  <h1 class="govuk-heading-xl">This heading</h1><p class="govuk-caption-xl hmrc-caption-xl"><span class="govuk-visually-hidden">This section is </span>That section</p></header>
`
      return request(app)
        .post("/hmrc/1.4.0/components/hmrcPageHeading")
        .send({
          text: "This heading",
          section: 'That section'
        })
        .expect(200)
        .then(response => {
          expect(response.text).toBe(expected)
        })
    })

      it("should return a govukTemplate", () => {
          const expected = `<!DOCTYPE html>
    <html lang="en" class="govuk-template ">
      <head>
        <meta charset="utf-8">
        <title>GOV.UK - The best place to find government services and information</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="theme-color" content="#0b0c0c"> 
        
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
    
          <link rel="shortcut icon" sizes="16x16 32x32 48x48" href="/assets/images/favicon.ico" type="image/x-icon">
          <link rel="mask-icon" href="/assets/images/govuk-mask-icon.svg" color="#0b0c0c"> 
          <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/govuk-apple-touch-icon-180x180.png">
          <link rel="apple-touch-icon" sizes="167x167" href="/assets/images/govuk-apple-touch-icon-167x167.png">
          <link rel="apple-touch-icon" sizes="152x152" href="/assets/images/govuk-apple-touch-icon-152x152.png">
          <link rel="apple-touch-icon" href="/assets/images/govuk-apple-touch-icon.png">
    
        
        
        <meta property="og:image" content="/assets/images/govuk-opengraph-image.png">
      </head>
      <body class="govuk-template__body ">
        <script>document.body.className = ((document.body.className) ? document.body.className + ' js-enabled' : 'js-enabled');</script>
    
          <a href="#main-content" class="govuk-skip-link">Skip to main content</a>
    
    
          <header class="govuk-header " role="banner" data-module="govuk-header">
      <div class="govuk-header__container govuk-width-container">
        <div class="govuk-header__logo">
          <a href="/" class="govuk-header__link govuk-header__link--homepage">
            <span class="govuk-header__logotype">
              <svg
                role="presentation"
                focusable="false"
                class="govuk-header__logotype-crown"
                xmlns="http://www.w3.org/2000/svg"
                viewbox="0 0 132 97"
                height="30"
                width="36"
              >
                <path
                  fill="currentColor" fill-rule="evenodd"
                  d="M25 30.2c3.5 1.5 7.7-.2 9.1-3.7 1.5-3.6-.2-7.8-3.9-9.2-3.6-1.4-7.6.3-9.1 3.9-1.4 3.5.3 7.5 3.9 9zM9 39.5c3.6 1.5 7.8-.2 9.2-3.7 1.5-3.6-.2-7.8-3.9-9.1-3.6-1.5-7.6.2-9.1 3.8-1.4 3.5.3 7.5 3.8 9zM4.4 57.2c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.5-1.5-7.6.3-9.1 3.8-1.4 3.5.3 7.6 3.9 9.1zm38.3-21.4c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.6-1.5-7.6.3-9.1 3.8-1.3 3.6.4 7.7 3.9 9.1zm64.4-5.6c-3.6 1.5-7.8-.2-9.1-3.7-1.5-3.6.2-7.8 3.8-9.2 3.6-1.4 7.7.3 9.2 3.9 1.3 3.5-.4 7.5-3.9 9zm15.9 9.3c-3.6 1.5-7.7-.2-9.1-3.7-1.5-3.6.2-7.8 3.7-9.1 3.6-1.5 7.7.2 9.2 3.8 1.5 3.5-.3 7.5-3.8 9zm4.7 17.7c-3.6 1.5-7.8-.2-9.2-3.8-1.5-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.3 3.5-.4 7.6-3.9 9.1zM89.3 35.8c-3.6 1.5-7.8-.2-9.2-3.8-1.4-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.4 3.6-.3 7.7-3.9 9.1zM69.7 17.7l8.9 4.7V9.3l-8.9 2.8c-.2-.3-.5-.6-.9-.9L72.4 0H59.6l3.5 11.2c-.3.3-.6.5-.9.9l-8.8-2.8v13.1l8.8-4.7c.3.3.6.7.9.9l-5 15.4v.1c-.2.8-.4 1.6-.4 2.4 0 4.1 3.1 7.5 7 8.1h.2c.3 0 .7.1 1 .1.4 0 .7 0 1-.1h.2c4-.6 7.1-4.1 7.1-8.1 0-.8-.1-1.7-.4-2.4V34l-5.1-15.4c.4-.2.7-.6 1-.9zM66 92.8c16.9 0 32.8 1.1 47.1 3.2 4-16.9 8.9-26.7 14-33.5l-9.6-3.4c1 4.9 1.1 7.2 0 10.2-1.5-1.4-3-4.3-4.2-8.7L108.6 76c2.8-2 5-3.2 7.5-3.3-4.4 9.4-10 11.9-13.6 11.2-4.3-.8-6.3-4.6-5.6-7.9 1-4.7 5.7-5.9 8-.5 4.3-8.7-3-11.4-7.6-8.8 7.1-7.2 7.9-13.5 2.1-21.1-8 6.1-8.1 12.3-4.5 20.8-4.7-5.4-12.1-2.5-9.5 6.2 3.4-5.2 7.9-2 7.2 3.1-.6 4.3-6.4 7.8-13.5 7.2-10.3-.9-10.9-8-11.2-13.8 2.5-.5 7.1 1.8 11 7.3L80.2 60c-4.1 4.4-8 5.3-12.3 5.4 1.4-4.4 8-11.6 8-11.6H55.5s6.4 7.2 7.9 11.6c-4.2-.1-8-1-12.3-5.4l1.4 16.4c3.9-5.5 8.5-7.7 10.9-7.3-.3 5.8-.9 12.8-11.1 13.8-7.2.6-12.9-2.9-13.5-7.2-.7-5 3.8-8.3 7.1-3.1 2.7-8.7-4.6-11.6-9.4-6.2 3.7-8.5 3.6-14.7-4.6-20.8-5.8 7.6-5 13.9 2.2 21.1-4.7-2.6-11.9.1-7.7 8.8 2.3-5.5 7.1-4.2 8.1.5.7 3.3-1.3 7.1-5.7 7.9-3.5.7-9-1.8-13.5-11.2 2.5.1 4.7 1.3 7.5 3.3l-4.7-15.4c-1.2 4.4-2.7 7.2-4.3 8.7-1.1-3-.9-5.3 0-10.2l-9.5 3.4c5 6.9 9.9 16.7 14 33.5 14.8-2.1 30.8-3.2 47.7-3.2z"
                ></path>
                <image src="/assets/images/govuk-logotype-crown.png" xlink:href="" class="govuk-header__logotype-crown-fallback-image" width="36" height="32"></image>
              </svg>
              <span class="govuk-header__logotype-text">
                GOV.UK
              </span>
            </span>
          </a>
        </div>
      </div>
    </header>
    
    
          <div class="govuk-width-container ">
            <main class="govuk-main-wrapper " id="main-content" role="main">
            </main>
          </div>
    
          <footer class="govuk-footer " role="contentinfo">
      <div class="govuk-width-container ">
        <div class="govuk-footer__meta">
          <div class="govuk-footer__meta-item govuk-footer__meta-item--grow">
    
            <svg
              role="presentation"
              focusable="false"
              class="govuk-footer__licence-logo"
              xmlns="http://www.w3.org/2000/svg"
              viewbox="0 0 483.2 195.7"
              height="17"
              width="41"
            >
              <path
                fill="currentColor"
                d="M421.5 142.8V.1l-50.7 32.3v161.1h112.4v-50.7zm-122.3-9.6A47.12 47.12 0 0 1 221 97.8c0-26 21.1-47.1 47.1-47.1 16.7 0 31.4 8.7 39.7 21.8l42.7-27.2A97.63 97.63 0 0 0 268.1 0c-36.5 0-68.3 20.1-85.1 49.7A98 98 0 0 0 97.8 0C43.9 0 0 43.9 0 97.8s43.9 97.8 97.8 97.8c36.5 0 68.3-20.1 85.1-49.7a97.76 97.76 0 0 0 149.6 25.4l19.4 22.2h3v-87.8h-80l24.3 27.5zM97.8 145c-26 0-47.1-21.1-47.1-47.1s21.1-47.1 47.1-47.1 47.2 21 47.2 47S123.8 145 97.8 145"
              />
            </svg>
            <span class="govuk-footer__licence-description">
              All content is available under the
              <a
                class="govuk-footer__link"
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                rel="license"
              >Open Government Licence v3.0</a>, except where otherwise stated
            </span>
          </div>
          <div class="govuk-footer__meta-item">
            <a
              class="govuk-footer__link govuk-footer__copyright-logo"
              href="https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/"
            >© Crown copyright</a>
          </div>
        </div>
      </div>
    </footer>
    
    
      </body>
    </html>`
          return request(app)
              .post("/govuk/3.5.0/components/govukTemplate")
              .send({})
              .expect(200)
              .then(response => {
                  expectHtmlToMatch(response.text, expected)
              })
      })

      it("should return a customised govukTemplate", () => {
          const expected = `<!DOCTYPE html>
<html lang="en" class="govuk-template app-html-class">
<head>
    <meta charset="utf-8">
    <title>GOV.UK - Customised page template</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="blue">

    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <link rel="shortcut icon" sizes="16x16 32x32 48x48" href="/assets/images/favicon.ico" type="image/x-icon">
    <link rel="mask-icon" href="/assets/images/govuk-mask-icon.svg" color="blue">
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/govuk-apple-touch-icon-180x180.png">
    <link rel="apple-touch-icon" sizes="167x167" href="/assets/images/govuk-apple-touch-icon-167x167.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/assets/images/govuk-apple-touch-icon-152x152.png">
    <link rel="apple-touch-icon" href="/assets/images/govuk-apple-touch-icon.png">

    <link href="custom-stylesheet.css" rel="stylesheet">


    <meta property="og:image" content="/assets/images/govuk-opengraph-image.png">
</head>
<body class="govuk-template__body app-body-class">
<script>document.body.className = ((document.body.className) ? document.body.className + ' js-enabled' : 'js-enabled');</script>

<a href="#main-content" class="govuk-skip-link">Custom skip link</a>
<header role="banner">Custom header</header>
<div class="govuk-width-container ">
    <p>Customised before content, <a class="govuk-link" href="#">this is a link</a>.        <main class="govuk-main-wrapper app-main-class" id="main-content" role="main">
        <h1 class="govuk-heading-xl">Customised page template</h1>        </main>
</div>

<footer role="contentinfo">Custom footer</footer>
<script src="custom-script.js"></script>  </body>
</html>
`
          return request(app)
              .post("/govuk/3.5.0/components/govukTemplate")
              .send({
                  "htmlClasses": "app-html-class",
                  "htmlLang": "en",
                  "themeColor": "blue",
                  "bodyClasses": "app-body-class",
                  "pageTitle": "GOV.UK - Customised page template",
                  "head": "\n  <link href=\"custom-stylesheet.css\" rel=\"stylesheet\">\n",
                  "mainClasses": "app-main-class",
                  "beforeContent": "<p>Customised before content, <a class=\"govuk-link\" href=\"#\">this is a link</a>.",
                  "header": "<header role=\"banner\">Custom header</header>",
                  "skipLink": "<a href=\"#main-content\" class=\"govuk-skip-link\">Custom skip link</a>",
                  "content": "<h1 class=\"govuk-heading-xl\">Customised page template</h1>",
                  "footer": "<footer role=\"contentinfo\">Custom footer</footer>",
                  "bodyEnd": "<script src=\"custom-script.js\"></script>"
              })
              .expect(200)
              .then(response => {
                  expectHtmlToMatch(response.text, expected)
              })
      })

  })

  describe('/govuk/:version/components/:component', () => {
    it("should return 500 and an error if the version requested is older than 3.0.0", () => {
      return request(app)
        .post("/govuk/2.3.4/components/govukButton")
        .send({ text: "Button from an unsupported version" })
        .expect(500)
        .then(response => {
          expect(response.text).toBe('This version of govuk-frontend is not supported')
        })
    })

    it("should return an older version of govukbutton", () => {
      const expected = `<button type="submit" class="govuk-button" data-module="govuk-button">
  Button from an older version
</button>`

      return request(app)
        .post("/govuk/3.0.0/components/govukButton")
        .send({ text: "Button from an older version" })
        .expect(200)
        .then(response => {
          expect(response.text).toBe(expected)
        })
    })

    it("should return a govukbutton", () => {
      const expected = `<button class="govuk-button" data-module="govuk-button">
  Save and continue
</button>`

      return request(app)
        .post("/govuk/3.3.0/components/govukButton")
        .send({ text: "Save and continue" })
        .expect(200)
        .then(response => {
          expect(response.text).toBe(expected)
        })
    })

    it("should return the text I provided", () => {
      const expected = `<button class="govuk-button" data-module="govuk-button">
  I Waz &#39;ere
</button>`

      return request(app)
        .post("/govuk/3.3.0/components/govukButton")
        .send({ text: "I Waz 'ere" })
        .expect(200)
        .then(response => {
          expect(response.text).toBe(expected)
        })
    })

    it("should support a complex component", () => {
      const expected = `<div class="govuk-form-group govuk-form-group--error">
<fieldset class="govuk-fieldset" role="group" aria-describedby="passport-issued-hint passport-issued-error">
  <legend class="govuk-fieldset__legend govuk-fieldset__legend--xl">
    <h1 class="govuk-fieldset__heading">
      When was your passport issued?
    </h1>
  </legend>
  <span id="passport-issued-hint" class="govuk-hint">
    For example, 12 11 2007
  </span>
  <span id="passport-issued-error" class="govuk-error-message">
    <span class="govuk-visually-hidden">Error:</span> The date your passport was issued must be in the past
  </span>
  <div class="govuk-date-input" id="passport-issued">
    <div class="govuk-date-input__item">
      <div class="govuk-form-group">
        <label class="govuk-label govuk-date-input__label" for="passport-issued-day">
          Day
        </label>
        <input class="govuk-input govuk-date-input__input govuk-input--width-2 govuk-input--error" id="passport-issued-day" name="passport-issued-day" type="number" value="6" pattern="[0-9]*">
      </div>
    </div>
    <div class="govuk-date-input__item">
      <div class="govuk-form-group">
        <label class="govuk-label govuk-date-input__label" for="passport-issued-month">
          Month
        </label>
        <input class="govuk-input govuk-date-input__input govuk-input--width-2 govuk-input--error" id="passport-issued-month" name="passport-issued-month" type="number" value="3" pattern="[0-9]*">
      </div>
    </div>
    <div class="govuk-date-input__item">
      <div class="govuk-form-group">
        <label class="govuk-label govuk-date-input__label" for="passport-issued-year">
          Year
        </label>
        <input class="govuk-input govuk-date-input__input govuk-input--width-4 govuk-input--error" id="passport-issued-year" name="passport-issued-year" type="number" value="2076" pattern="[0-9]*">
      </div>
    </div>
  </div>
</fieldset>
</div>`

      return request(app)
        .post("/govuk/3.3.0/components/govukDateInput")
        .send({
          fieldset: {
            legend: {
              text: "When was your passport issued?",
              isPageHeading: true,
              classes: "govuk-fieldset__legend--xl"
            }
          },
          hint: {
            text: "For example, 12 11 2007"
          },
          errorMessage: {
            text: "The date your passport was issued must be in the past"
          },
          id: "passport-issued",
          namePrefix: "passport-issued",
          items: [
            {
              classes: "govuk-input--width-2 govuk-input--error",
              name: "day",
              value: "6"
            },
            {
              classes: "govuk-input--width-2 govuk-input--error",
              name: "month",
              value: "3"
            },
            {
              classes: "govuk-input--width-4 govuk-input--error",
              name: "year",
              value: "2076"
            }
          ]
        })
        .expect(200)
        .then(response => {
          expectHtmlToMatch(response.text, expected)
        })
    })

    it("should render without parameters when none are provided", () => {
      const expected = `<footer class="govuk-footer " role="contentinfo">
  <div class="govuk-width-container ">

    <div class="govuk-footer__meta">
      <div class="govuk-footer__meta-item govuk-footer__meta-item--grow">

        <svg
            role="presentation"
            focusable="false"
            class="govuk-footer__licence-logo"
            xmlns="http://www.w3.org/2000/svg"
            viewbox="0 0 483.2 195.7"
            height="17"
            width="41"
        >
          <path
              fill="currentColor"
              d="M421.5 142.8V.1l-50.7 32.3v161.1h112.4v-50.7zm-122.3-9.6A47.12 47.12 0 0 1 221 97.8c0-26 21.1-47.1 47.1-47.1 16.7 0 31.4 8.7 39.7 21.8l42.7-27.2A97.63 97.63 0 0 0 268.1 0c-36.5 0-68.3 20.1-85.1 49.7A98 98 0 0 0 97.8 0C43.9 0 0 43.9 0 97.8s43.9 97.8 97.8 97.8c36.5 0 68.3-20.1 85.1-49.7a97.76 97.76 0 0 0 149.6 25.4l19.4 22.2h3v-87.8h-80l24.3 27.5zM97.8 145c-26 0-47.1-21.1-47.1-47.1s21.1-47.1 47.1-47.1 47.2 21 47.2 47S123.8 145 97.8 145"
          />
        </svg>
        <span class="govuk-footer__licence-description">
          All content is available under the
          <a
              class="govuk-footer__link"
              href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
              rel="license"
          >Open Government Licence v3.0</a>, except where otherwise stated
        </span>
      </div>
      <div class="govuk-footer__meta-item">
        <a
            class="govuk-footer__link govuk-footer__copyright-logo"
            href="https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/"
        >© Crown copyright</a>
      </div>
    </div>
  </div>
</footer>
`

      return request(app)
        .post("/govuk/3.3.0/components/govukFooter")
        .send()
        .expect(200)
        .then(response => {
          expectHtmlToMatch(response.text, expected)
        })
    })
  })
  
  describe('/examples-output/:org/:component', () => {
    const expected = [
      {
        html: `<div class=\"govuk-form-group\">
  <label class=\"govuk-label\" for=\"file-upload-1\">
    Upload a file
  </label>
  <input class=\"govuk-file-upload\" id=\"file-upload-1\" name=\"file-upload-1\" type=\"file\">
</div>`,
        md5: '7a23adc1045d2b75bde07ef81d61c469',
        name: 'file-upload/default',
        nunjucks: `{% from \"govuk/components/file-upload/macro.njk\" import govukFileUpload %}

{{ govukFileUpload({
  id: \"file-upload-1\",
  name: \"file-upload-1\",
  label: {
    text: \"Upload a file\"
  }
}) }}`,
      },
      {
        html: `<div class=\"govuk-form-group govuk-form-group--error\">
  <label class=\"govuk-label\" for=\"file-upload-1\">
    Upload a file
  </label>
  <span id=\"file-upload-1-error\" class=\"govuk-error-message\">
  <span class=\"govuk-visually-hidden\">Error:</span> The CSV must be smaller than 2MB
  </span>
  <input class=\"govuk-file-upload govuk-file-upload--error\" id=\"file-upload-1\" name=\"file-upload-1\" type=\"file\" aria-describedby=\"file-upload-1-error\">
</div>`,
        md5: '62ed65b2964b40280c34d3912f1786e5',
        name: 'file-upload/error',
        nunjucks: `{% from \"govuk/components/file-upload/macro.njk\" import govukFileUpload %}

{{ govukFileUpload({
  id: \"file-upload-1\",
  name: \"file-upload-1\",
  label: {
    text: \"Upload a file\"
  },
  errorMessage: {
    text: \"The CSV must be smaller than 2MB\"
  }
}) }}`,
      }
    ]

    it('should return an array of examples with markup and md5 hash', (done) => {
      return request(app)
        .get("/examples-output/govuk/file-upload")
        .expect(200)
        .then(response => {
          expect(response.body).toEqual(expected)
          done()
        })
    })
    
    it('should work if the request uses the macro name', (done) => {
      return request(app)
        .get("/examples-output/govuk/govukFileUpload")
        .expect(200)
        .then(response => {
          expect(response.body).toEqual(expected)
          done()
        })
    })

    it('should return a 500 if requested component does not exist', () => {
      return request(app)
        .get("/examples-output/govuk/foo")
        .expect(500)
    })

    it('should work with HMRC components', (done) => {
      return request(app)
        .get("/examples-output/hmrc/green-button")
        .expect(200)
        .then(response => {
          expect(response.body).toEqual([{
            name: "green-button/example",
            html: "<h1 class=\"govuk-heading-xl\">Check your National Insurance record</h1>\n\n<p class=\"govuk-body\">You can check your National Insurance record online to see:</p>\n\n<ul class=\"govuk-list govuk-list--bullet\">\n  <li>what you’ve paid, up to the start of the current tax year (6 April 2019)</li>\n  <li>any <a href=\"#\" class=\"govuk-link\">National Insurance credits</a> you’ve received</li>\n  <li>if gaps in contributions or credits mean some years do not count towards your State Pension (they are not ‘qualifying years’)</li>\n  <li>if you can pay <a href=\"#\" class=\"govuk-link\">voluntary contributions</a> to fill any gaps and how much this will cost</li>\n</ul>\n\n<p class=\"govuk-body\">\n  Your online record does not cover how much <a href=\"#\" class=\"govuk-link\">State Pension you’re likely to get</a>.\n</p>\n\n<button class=\"govuk-button govuk-button--start\" data-module=\"govuk-button\">\n  Start now\n  <svg class=\"govuk-button__start-icon\" xmlns=\"http://www.w3.org/2000/svg\" width=\"17.5\" height=\"19\" viewBox=\"0 0 33 40\" role=\"presentation\" focusable=\"false\">\n    <path fill=\"currentColor\" d=\"M0 0h13l20 20-20 20H0l20-20z\"/>\n  </svg>\n</button>",
            md5: "bdb85a4bb9fdc85856ee5c24ab1f713e",
            nunjucks: "{% from \"govuk/components/button/macro.njk\" import govukButton %}\n\n<h1 class=\"govuk-heading-xl\">Check your National Insurance record</h1>\n\n<p class=\"govuk-body\">You can check your National Insurance record online to see:</p>\n\n<ul class=\"govuk-list govuk-list--bullet\">\n  <li>what you’ve paid, up to the start of the current tax year (6 April 2019)</li>\n  <li>any <a href=\"#\" class=\"govuk-link\">National Insurance credits</a> you’ve received</li>\n  <li>if gaps in contributions or credits mean some years do not count towards your State Pension (they are not ‘qualifying years’)</li>\n  <li>if you can pay <a href=\"#\" class=\"govuk-link\">voluntary contributions</a> to fill any gaps and how much this will cost</li>\n</ul>\n\n<p class=\"govuk-body\">\n  Your online record does not cover how much <a href=\"#\" class=\"govuk-link\">State Pension you’re likely to get</a>.\n</p>\n\n{{ govukButton({\n  text: \"Start now\",\n  isStartButton: true\n}) }}"
          }])
          done()
        })
    })
  })

  describe('/', () => {
    it('should return rendered markdown of README.md', (done) => {
      let expected
      fs.readFile(readMe, 'utf8', (err, contents) => {
        expected = marked(contents)
      })

      return request(app)
        .get("/")
        .expect(200)
        .then(response => {
          expect(response.text).toEqual(expected)
          done()
        })
    })
  })

  describe('/invalid-path', () => {
    it('should return a 404', () => {
      return request(app)
        .get("/invalid-path")
        .expect(404)
    })
  })

})
