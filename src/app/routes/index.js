const express = require('express')

const rootController = require('../controllers/rootController')
const examplesController = require('../controllers/examplesController')
const componentController = require('../controllers/componentController')

const router = express.Router()

router.use('/examples-output', examplesController)
router.use('/component/govuk', componentController('govuk'))
router.use('/component/hmrc', componentController('hmrc'))
router.use(rootController)

module.exports = router