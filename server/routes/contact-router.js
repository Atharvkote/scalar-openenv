const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact-controller');


// Start and Join Session
router.route('/new-message').post(contactController.newContact);
router.route('/all-message').get(contactController.getAllContact);



module.exports = router;