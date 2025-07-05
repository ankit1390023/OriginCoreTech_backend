const express = require('express');
const router = express.Router();
const { otpLimiter, sendOtp, verifyOtp } = require('../controllers/otpController');


router.post('/send-otp', otpLimiter, sendOtp);
router.post('/verify-otp', otpLimiter, verifyOtp);

module.exports = router;
