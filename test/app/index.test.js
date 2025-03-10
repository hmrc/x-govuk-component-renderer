const request = require('supertest');
const fs = require('fs');
const marked = require('marked');

const { readMe } = require('../../src/app/constants');

const app = require('../../src/app');

const expectHtmlToMatch = (expected, actual) => {
  const normalise = (str) => str.replace(/\s+/g, '\n').trim();
  expect(normalise(expected)).toBe(normalise(actual));
};

jest.setTimeout(10000);

describe('X-GOVUK Component Renderer', () => {
  describe('HMRC component endpoint', () => {
    it('should return 500 and an error if the version requested is older than 1.0.0', () => request(app)
      .post('/component/hmrc/0.1.2/hmrcPageHeading')
      .send({ text: 'Page heading from an unsupported version' })
      .expect(500)
      .then((response) => {
        expect(response.text).toBe('This version of hmrc-frontend is not supported');
      }));

    it('should return a hmrc page heading', () => {
      const expected = `<header class="hmrc-page-heading">
  <h1 class="govuk-heading-xl">This heading</h1><p class="govuk-caption-xl hmrc-caption-xl"><span class="govuk-visually-hidden">This section is </span>That section</p></header>
`;

      request(app)
        .post('/component/hmrc/1.4.0/hmrcPageHeading')
        .send({
          text: 'This heading',
          section: 'That section',
        })
        .expect(200)
        .then((response) => {
          expect(response.text).toBe(expected);
        });
    });

    it('should return a currencyInput (which requires govuk-frontend)', () => {
      const expected = `<div class="govuk-form-group">
\t<div class="hmrc-currency-input__wrapper">
\t\t<span class="hmrc-currency-input__unit" aria-hidden="true">£</span>
\t\t<input
            class="govuk-input"
            id="mpqzobgghvhv"
            name=""
            type="text"            inputmode="decimal"/>

    </div>
\t</div>`;
      return request(app)
        .post('/component/hmrc/1.12.0/hmrcCurrencyInput')
        .send({
          id: 'mpqzobgghvhv',
        })
        .expect(200)
        .then((response) => {
          expectHtmlToMatch(response.text, expected);
        });
    });
  });

  describe('GOVUK component', () => {
    it('should return 500 and an error if the version requested is older than 3.0.0', () => request(app)
      .post('/component/govuk/2.3.4/govukButton')
      .send({ text: 'Button from an unsupported version' })
      .expect(500)
      .then((response) => {
        expect(response.text).toBe('This version of govuk-frontend is not supported');
      }));

    it('should return an older version of govukbutton', () => {
      const expected = `<button type="submit" class="govuk-button" data-module="govuk-button">
  Button from an older version
</button>`;

      return request(app)
        .post('/component/govuk/3.0.0/govukButton')
        .send({ text: 'Button from an older version' })
        .expect(200)
        .then((response) => {
          expect(response.text).toBe(expected);
        });
    });

    it('should return a govukbutton', () => {
      const expected = `<button class="govuk-button" data-module="govuk-button">
  Save and continue
</button>`;

      return request(app)
        .post('/component/govuk/3.3.0/govukButton')
        .send({ text: 'Save and continue' })
        .expect(200)
        .then((response) => {
          expect(response.text).toBe(expected);
        });
    });

    it('should be able to respond to old an new versions simultaneously', () => {
      const input = { text: 'Button Example', isStartButton: true };
      const older = request(app)
        .post('/component/govuk/3.0.0/govukButton')
        .send(input)
        .expect(200)
        .then((response) => {
          expect(response.text.startsWith('<button type="submit" class="govuk-button')).toBe(true);
          expect(response.text.includes('role="presentation"')).toBe(true);
          expect(response.text.includes('aria-hidden="true"')).toBe(false);
        });

      const medium = request(app)
        .post('/component/govuk/3.3.0/govukButton')
        .send(input)
        .expect(200)
        .then((response) => {
          expect(response.text.startsWith('<button class="govuk-button')).toBe(true);
          expect(response.text.includes('role="presentation"')).toBe(true);
          expect(response.text.includes('aria-hidden="true"')).toBe(false);
        });

      const newer = request(app)
        .post('/component/govuk/3.6.0/govukButton')
        .send(input)
        .expect(200)
        .then((response) => {
          expect(response.text.startsWith('<button class="govuk-button')).toBe(true);
          expect(response.text.includes('role="presentation"')).toBe(false);
          expect(response.text.includes('aria-hidden="true"')).toBe(true);
        });

      return Promise.all([older, medium, newer]);
    });

    it('should return the text I provided', () => {
      const expected = `<button class="govuk-button" data-module="govuk-button">
  I Waz &#39;ere
</button>`;

      return request(app)
        .post('/component/govuk/3.3.0/govukButton')
        .send({ text: "I Waz 'ere" })
        .expect(200)
        .then((response) => {
          expect(response.text).toBe(expected);
        });
    });

    it('should support a complex component', () => {
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
</div>`;

      return request(app)
        .post('/component/govuk/3.3.0/govukDateInput')
        .send({
          fieldset: {
            legend: {
              text: 'When was your passport issued?',
              isPageHeading: true,
              classes: 'govuk-fieldset__legend--xl',
            },
          },
          hint: {
            text: 'For example, 12 11 2007',
          },
          errorMessage: {
            text: 'The date your passport was issued must be in the past',
          },
          id: 'passport-issued',
          namePrefix: 'passport-issued',
          items: [
            {
              classes: 'govuk-input--width-2 govuk-input--error',
              name: 'day',
              value: '6',
            },
            {
              classes: 'govuk-input--width-2 govuk-input--error',
              name: 'month',
              value: '3',
            },
            {
              classes: 'govuk-input--width-4 govuk-input--error',
              name: 'year',
              value: '2076',
            },
          ],
        })
        .expect(200)
        .then((response) => {
          expectHtmlToMatch(response.text, expected);
        });
    });

    it('should render without parameters when none are provided', () => {
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
`;

      return request(app)
        .post('/component/govuk/3.3.0/govukFooter')
        .send()
        .expect(200)
        .then((response) => {
          expectHtmlToMatch(response.text, expected);
        });
    });
  });

  describe('Examples output', () => {
    const expected = [
      {
        html: `<div class="govuk-form-group">
  <label class="govuk-label" for="file-upload-1">
    Upload a file
  </label>
  <input class="govuk-file-upload" id="file-upload-1" name="fileUpload1" type="file">
</div>`,
        name: 'file-upload/default',
        nunjucks: `{% from "govuk/components/file-upload/macro.njk" import govukFileUpload %}

{{ govukFileUpload({
  id: "file-upload-1",
  name: "fileUpload1",
  label: {
    text: "Upload a file"
  }
}) }}`,
      },
      {
        html: `<div class="govuk-form-group govuk-form-group--error">
  <label class="govuk-label" for="file-upload-1">
    Upload a file
  </label>
  <p id="file-upload-1-error" class="govuk-error-message">
    <span class="govuk-visually-hidden">Error:</span> The CSV must be smaller than 2MB
  </p>
  <input class="govuk-file-upload govuk-file-upload--error" id="file-upload-1" name="fileUpload1" type="file" aria-describedby="file-upload-1-error">
</div>`,
        name: 'file-upload/error',
        nunjucks: `{% from "govuk/components/file-upload/macro.njk" import govukFileUpload %}

{{ govukFileUpload({
  id: "file-upload-1",
  name: "fileUpload1",
  label: {
    text: "Upload a file"
  },
  errorMessage: {
    text: "The CSV must be smaller than 2MB"
  }
}) }}`,
      },
    ];

    it('should return an array of examples with markup and Nunjucks', () => request(app)
      .get('/example-usage/govuk/file-upload')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(expected);
      }));

    it('should work if the request uses the macro name', () => request(app)
      .get('/example-usage/govuk/govukFileUpload')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(expected);
      }));

    it('should return a 500 if requested component does not exist', () => request(app)
      .get('/example-usage/govuk/foo')
      .expect(500));

    it('should work with HMRC components', () => request(app)
      .get('/example-usage/hmrc/timeline')
      .expect(200)
      .then((response) => {
        expect(response.body)
          .toEqual([
            {
              name: 'timeline/example',
              html: '<ol class="hmrc-timeline">\n<li class="hmrc-timeline__event">\n        <h2 class="hmrc-timeline__event-title">Repayment complete</h2>\n        <time class="hmrc-timeline__event-meta" datetime="2020-07-15">15 July 2020</time>\n        <div class="hmrc-timeline__event-content">\n          <p class="govuk-body">We repaid you £50. It will take 3 days for the money to reach your account.</p>\n        </div>\n      </li><li class="hmrc-timeline__event">\n        <h2 class="hmrc-timeline__event-title">Checking your claim</h2>\n        <time class="hmrc-timeline__event-meta" datetime="2020-07-14">14 July 2020</time>\n        <div class="hmrc-timeline__event-content">\n          <p class="govuk-body">We received your return. You claimed you were due a repayment of £50. We are checking your claim.</p>\n        </div>\n      </li>  </ol>',
              nunjucks: "{%- from \"hmrc/components/timeline/macro.njk\" import hmrcTimeline -%}\n\n{% set exampleContent1 %}<p class=\"govuk-body\">We received your return. You claimed you were due a repayment of £50. We are checking your claim.</p>{% endset %}\n{% set exampleContent2 %}<p class=\"govuk-body\">We repaid you £50. It will take 3 days for the money to reach your account.</p>{% endset %}\n\n  {{ hmrcTimeline({\n    headingLevel: 2,\n    events: [\n      {\n        title: 'Repayment complete',\n        datetime: '2020-07-15',\n        time: '15 July 2020',\n        content: exampleContent2\n      },\n      {\n        title: 'Checking your claim',\n        datetime: '2020-07-14',\n        time: '14 July 2020',\n        content: exampleContent1\n      }\n    ]\n  }) }}",
            },
            {
              name: 'timeline/example-welsh',
              html: "<ol class=\"hmrc-timeline\">\n<li class=\"hmrc-timeline__event\">\n        <h2 class=\"hmrc-timeline__event-title\">Ad-daliad wedi’i wneud</h2>\n        <time class=\"hmrc-timeline__event-meta\" datetime=\"2020-07-15\">15 Gorffennaf 2020</time>\n        <div class=\"hmrc-timeline__event-content\">\n          <p class=\"govuk-body\">Gwnaethom ad-dalu £50 i chi. Bydd yn cymryd hyd at 3 diwrnod i'r arian gyrraedd eich cyfrif.</p>\n        </div>\n      </li><li class=\"hmrc-timeline__event\">\n        <h2 class=\"hmrc-timeline__event-title\">Gwirio’ch hawliad</h2>\n        <time class=\"hmrc-timeline__event-meta\" datetime=\"2020-07-14\">14 Gorffennaf 2020</time>\n        <div class=\"hmrc-timeline__event-content\">\n          <p class=\"govuk-body\">Daeth eich Ffurflen Dreth i law. Gwnaethoch honni bod ad-daliad o £50 yn ddyledus i chi. Rydym yn gwirio’ch hawliad.</p>\n        </div>\n      </li>  </ol>",
              nunjucks: "{%- from \"hmrc/components/timeline/macro.njk\" import hmrcTimeline -%}\n\n{% set exampleContent1 %}<p class=\"govuk-body\">Daeth eich Ffurflen Dreth i law. Gwnaethoch honni bod ad-daliad o £50 yn ddyledus i chi. Rydym yn gwirio’ch hawliad.</p>{% endset %}\n{% set exampleContent2 %}<p class=\"govuk-body\">Gwnaethom ad-dalu £50 i chi. Bydd yn cymryd hyd at 3 diwrnod i'r arian gyrraedd eich cyfrif.</p>{% endset %}\n\n  {{ hmrcTimeline({\n    headingLevel: 2,\n    events: [\n      {\n        title: 'Ad-daliad wedi’i wneud',\n        datetime: '2020-07-15',\n        time: '15 Gorffennaf 2020',\n        content: exampleContent2\n      },\n      {\n        title: 'Gwirio’ch hawliad',\n        datetime: '2020-07-14',\n        time: '14 Gorffennaf 2020',\n        content: exampleContent1\n      }\n    ]\n  }) }}",
            },
          ]);
      }));

    it('should list GOVUK components which have examples', () => request(app)
      .get('/example-usage/govuk')
      .expect(200)
      .then((response) => {
        expect(response.body.length > 0).toBe(true);
        response.body.forEach((item) => {
          expect(item.startsWith('/example-usage/govuk/')).toBe(true);
        });
      }));

    it('should list HMRC components which have examples', () => request(app)
      .get('/example-usage/hmrc')
      .expect(200)
      .then((response) => {
        expect(response.body.length > 0).toBe(true);
        response.body.forEach((item) => {
          expect(item.startsWith('/example-usage/hmrc/')).toBe(true);
        });
      }));

    it('should not add double forward slashes', () => request(app)
      .get('/example-usage/hmrc/')
      .expect(200)
      .then((response) => {
        expect(response.body.length > 0).toBe(true);
        response.body.forEach((item) => {
          expect(item.startsWith('/example-usage/hmrc//')).toBe(false);
        });
      }));

    it('should list the available organisations', () => request(app)
      .get('/example-usage/')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual([
          '/example-usage/govuk',
          '/example-usage/hmrc',
        ]);
      }));

    it('should list HMRC components which have examples', () => request(app)
      .get('/example-usage/hmrc')
      .expect(200)
      .then((response) => {
        expect(response.body.length > 0).toBe(true);
        response.body.forEach((item) => {
          expect(item.startsWith('/example-usage/hmrc/')).toBe(true);
        });
      }));
  });

  describe('GOVUK template', () => {
    it('should return 500 and an error if the version requested is older than 3.0.0', () => request(app)
      .post('/template/govuk/2.3.4/default')
      .send({})
      .expect(500)
      .then((response) => {
        expect(response.text).toBe('This version of govuk-frontend is not supported');
      }));

    it('should reject unknown templates', () => request(app)
      .post('/template/govuk/3.6.0/some-template')
      .send({})
      .expect(400)
      .then((response) => {
        expect(response.text).toBe('Currently only "govuk" and the "default" template is supported');
      }));

    it('should render govuk template with blocks and variables', () => request(app)
      .post('/template/govuk/3.6.0/default')
      .send({
        variables: {
          htmlLang: 'abc',
          htmlClasses: 'def',
          assetPath: '/ghi/jkl',
          bodyAttributes: {
            one: 1,
            'data-two': 'this-is two',
          },
        },
        blocks: {
          beforeContent: 'abcdefghijklmnop',
          pageTitle: 'This is the title',
          headIcons: 'headIcons',
          skipLink: 'skipLink',
          header: 'the header',
          main: 'the main',
          footer: 'The footer',
        },
      })
      .expect(200)
      .then((response) => {
        expectHtmlToMatch(response.text, `<!DOCTYPE html>
<html lang="abc" class="govuk-template def">

<head>
\t<meta charset="utf-8">
\t<title>This is the title</title>
\t<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
\t<meta name="theme-color" content="#0b0c0c">

\t<meta http-equiv="X-UA-Compatible" content="IE=edge">

\theadIcons


\t<meta property="og:image" content="/ghi/jkl/images/govuk-opengraph-image.png">
</head>

<body class="govuk-template__body " one="1" data-two="this-is two">
\t<script>document.body.className = ((document.body.className) ? document.body.className + ' js-enabled' : 'js-enabled');</script>

\tskipLink
\tthe header
\tthe main
\tThe footer
</body>

</html>
`.replace(/\s+/g, '\n'));
      }));

    it('should render v5 govuk template', () => request(app)
      .post('/template/govuk/5.0.0/default')
      .send({
        variables: {
          htmlLang: 'abc',
          htmlClasses: 'def',
          assetUrl: '/ghi/jkl',
          bodyAttributes: {
            one: 1,
            'data-two': 'this-is two',
          },
        },
        blocks: {
          beforeContent: 'abcdefghijklmnop',
          pageTitle: 'This is the title',
          headIcons: 'headIcons',
          skipLink: 'skipLink',
          header: 'the header',
          main: 'the main',
          footer: 'The footer',
        },
      })
      .expect(200)
      .then((response) => {
        expectHtmlToMatch(response.text, `<!DOCTYPE html>
<html lang="abc" class="govuk-template def">

<head>
\t<meta charset="utf-8">
\t<title>This is the title</title>
\t<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
\t<meta name="theme-color" content="#0b0c0c">

\theadIcons


\t<meta property="og:image" content="/ghi/jkl/images/govuk-opengraph-image.png">
</head>

<body class="govuk-template__body" one="1" data-two="this-is two">
\t<script>document.body.className += ' js-enabled' + ('noModule' in HTMLScriptElement.prototype ? ' govuk-frontend-supported' : '');</script>

\tskipLink
\tthe header
\tthe main
\tThe footer
</body>

</html>
`.replace(/\s+/g, '\n'));
      }));
  });

  describe('snapshotter', () => {
    it('should return a snapshot from a recent GOVUK version', () => request(app)
      .get('/snapshot/govuk/3.6.0')
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(188);
        expect(response.body.map((x) => x.exampleId).filter((x) => x.startsWith('footer-'))).toEqual([
          'footer-default',
          'footer-with-meta',
          'footer-with-custom-meta',
          'footer-with-meta-links-and-meta-content',
          'footer-with-custom-meta2',
          'footer-with-navigation',
          'footer-GOV.UK',
          'footer-Three-equal-columns',
        ]);
      }));
    it('should return a snapshot from a recent HMRC version', () => request(app)
      .get('/snapshot/hmrc/1.12.0')
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(42);
        expect(response.body.map((x) => x.exampleId).filter((x) => x.startsWith('currency-'))).toEqual([
          'currency-input-default',
        ]);
      }));
    it('should return a snapshot from an older HMRC version', () => request(app)
      .get('/snapshot/hmrc/1.1.0')
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(38);
        expect(response.body.map((x) => x.exampleId).filter((x) => x.startsWith('currency-'))).toEqual([]);
      }));
    it('should render using the correct govuk-frontend version', () => Promise.all([
      request(app)
        .get('/snapshot/govuk/3.6.0')
        .expect(200)
        .then((response) => {
          const { output } = response.body.filter((x) => x.exampleId === 'button-start-link')[0];
          expect(output.includes('role="button"')).toBeTruthy();
          expect(output.includes('aria-hidden="true"')).toBe(true);
        }),
      request(app)
        .get('/snapshot/govuk/3.5.0')
        .expect(200)
        .then((response) => {
          const { output } = response.body.filter((x) => x.exampleId === 'button-start-link')[0];
          expect(output.includes('role="presentation"')).toBe(true);
          expect(output.includes('aria-hidden="true"')).toBe(false);
        }),
      request(app)
        .get('/snapshot/govuk/5.0.0-beta.1') // TODO this should be updated to the 5.0.0 release version when available
        .expect(200)
        .then((response) => {
          const { output } = response.body.filter((x) => x.exampleId === 'button-start-link')[0];
          expect(output.includes('role="button"')).toBeTruthy();
          expect(output.includes('aria-hidden="true"')).toBeTruthy();
        }),
    ]));
  });

  describe('Root page', () => {
    it('should return rendered markdown of README.md', () => {
      let expected;
      fs.readFile(readMe, 'utf8', (err, contents) => {
        expected = marked.parse(contents);
      });

      return request(app)
        .get('/')
        .expect(200)
        .then((response) => {
          expect(response.text)
            .toEqual(expected);
        });
    });
  });

  describe('Unknown paths', () => {
    it('should return a 404', () => request(app)
      .get('/unknown-path')
      .expect(404));
  });
});
