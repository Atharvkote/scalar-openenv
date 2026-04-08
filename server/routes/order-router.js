const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order-controller');


// Start and Join Session
router.route('/join-session').post(orderController.startOrJoinSession);
router.route('/new-order').post(orderController.placeOrder);
router.route('/table-shift').post(orderController.mergeSession);


module.exports = router;