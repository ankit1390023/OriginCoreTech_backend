const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');

router.get('/auth', otpController.authUrl);
router.get('/oauth2callback', otpController.oauth2callback);
router.post('/send-otp', otpController.sendOtp);
router.post('/verify-otp', otpController.verifyOtp);

module.exports = router;
