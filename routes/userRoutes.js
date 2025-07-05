const express = require('express');
const router = express.Router();
const userController = require('../controllers/userAuthController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/getUserData', userController.getUserDetailsByEmail);

router.post('/changeEmail', authMiddleware, userController.changeEmail);
router.post('/changePassword', authMiddleware, userController.changePassword);
router.post('/softDeleteAccount', authMiddleware, userController.softDeleteAccount);

router.post('/forgotPassword', userController.forgotPassword);
router.post('/resetPasswordWithOtp', userController.resetPasswordWithOtp);

module.exports = router;
