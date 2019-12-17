const express = require('express')
const bodyParser = require('body-parser')

const rootController = require('../controllers/rootController')
const examplesController = require('../controllers/examplesController')
const componentController = require('../controllers/componentController')

const govukComponentController = (req, res) => componentController(req, res, 'govuk')
const hmrcComponentController = (req, res) => componentController(req, res, 'hmrc')

const router = express.Router()
const jsonParser = bodyParser.json()

router.get('/', rootController)
router.get('/examples-output/:component', examplesController)
router.post('/govuk/:version/components/:component', jsonParser, govukComponentController)
router.post('/hmrc/:version/components/:component', jsonParser, hmrcComponentController)

module.exports = router