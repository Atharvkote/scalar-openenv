const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommendation-controller');


// Start and Join Session
router.route('/recommendations/tensorflow').post(recommendController.recommend);

module.exports = router;