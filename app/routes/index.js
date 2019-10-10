const express = require('express')
const bodyParser = require('body-parser')

const {
    rootController,
    examplesController,
    componentController
} = require('../controllers')

const router = express.Router()
const jsonParser = bodyParser.json()

router.get('/', rootController)
router.get('/examples-output/:component', examplesController)
router.post('/govuk/v3.3.0/components/:component', jsonParser, componentController)

module.exports = router