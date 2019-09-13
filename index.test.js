const request = require("supertest")
const app = require("./")

expectHtmlToMatch = (expected, actual) => {
  const normalise = str => str.replace(/\s+/g, "\n").trim()
  expect(normalise(expected)).toBe(normalise(actual))
}

describe("Templates as a service... again!", () => {
  it("should return a govukbutton", () => {
    const expected = `<button class="govuk-button" data-module="govuk-button">
  Save and continue
</button>`

    return request(app)
      .post("/govuk/v3.2.0/components/govukButton")
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
      .post("/govuk/v3.2.0/components/govukButton")
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
      .post("/govuk/v3.2.0/components/govukDateInput")
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
      .post("/govuk/v3.2.0/components/govukFooter")
      .send()
      .expect(200)
      .then(response => {
        expectHtmlToMatch(response.text, expected)
      })
  })
})
