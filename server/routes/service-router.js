const express = require('express');
const router = express.Router();

const serviceController = require('../controllers/service-controller');

router.route('/all-services').get(serviceController.services);
router.route('/single-service').get(serviceController.singleService);


module.exports = router;