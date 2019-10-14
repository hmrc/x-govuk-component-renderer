const express = require('express')
const bodyParser = require('body-parser')

const rootController = require('../controllers/rootController')
const examplesController = require('../controllers/examplesController')
const componentController = require('../controllers/componentController')

const router = express.Router()
const jsonParser = bodyParser.json()

router.get('/', rootController)
router.get('/examples-output/:component', examplesController)
router.post('/govuk/v3.3.0/components/:component', jsonParser, componentController)

module.exports = router