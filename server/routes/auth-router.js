const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth-controller');

router.route('/register').post(authController.register);
router.route('/login').post(authController.login);
router.route('/google-login').get(authController.googleLogin);
router.route('/current-user').get(authController.getCurrentUser);

// Admin Logic & Register
router.route('/admin-register').post(authController.adminRegister);
router.route('/admin-login').post(authController.adminLogin);



module.exports = router;