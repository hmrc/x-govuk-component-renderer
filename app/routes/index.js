const express = require('express')

const rootController = require('../controllers/rootController')
const examplesController = require('../controllers/examplesController')
const componentRouter = require('../routers/componentRouter')

const router = express.Router()

router.get('/', rootController)
router.get('/examples-output/:component', examplesController)
router.use(componentRouter)

module.exports = router