const express = require('express');
const router = express.Router();
const userDetailController = require('../controllers/userdetailController');


router.post('/detail', userDetailController.createUserDetails);
router.get('/detail/:userId', userDetailController.getUserDetailsByUserId);
router.put('/detail/:userId', userDetailController.updateUserDetailsByUserId);

module.exports = router;
