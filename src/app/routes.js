const express = require('express');

const rootController = require('./controllers/rootController');
const examplesController = require('./controllers/examplesController');
const componentController = require('./controllers/componentController');
const snapshotController = require('./controllers/snapshotController');
const templateController = require('./controllers/templateController');

const router = express.Router();

router.use('/example-usage', examplesController);
router.use('/component', componentController);
router.use('/template', templateController);
router.use('/snapshot', snapshotController);
router.use(rootController);

module.exports = router;
