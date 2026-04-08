const express = require('express');
const router = express.Router();
const paymentController = require("../controllers/payment-controller");


// for generate bill
router.route('/generate-bill').post(paymentController.generateBill);

// Handle Cash Payment
router.route('/cash-payment').post(paymentController.cashPayment);

// For new Payment of razorpay
router.route('/online-new-payment').post(paymentController.onlineRazorPayment);
// Verification of razorpay payment
router.route('/verify-payment').post(paymentController.RazorPaymentVerification);

// Get API Key
router.route('/get-api-key').get(paymentController.getRazorApiKey);

// Export
module.exports = router;

