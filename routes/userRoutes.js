const express = require('express');
const router = express.Router();
const userController = require('../controllers/userAuthController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/getUserData',userController.getUserDetailsByEmail)
module.exports = router;
