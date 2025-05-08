const express = require('express');
const router = express.Router();
const userDetailController = require('../controllers/userdetailController');

// Correct function name used here
router.post('/detail', userDetailController.createUserDetails);

// New routes for fetching and updating user details
router.get('/detail/:userId', userDetailController.getUserDetailsByUserId);
router.put('/detail/:userId', userDetailController.updateUserDetailsByUserId);

module.exports = router;
