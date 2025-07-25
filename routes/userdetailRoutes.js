const express = require('express');
const router = express.Router();
const userDetailController = require('../controllers/userdetailController');
const authMiddleware = require('../middleware/authMiddleware');



router.post('/detail', authMiddleware, userDetailController.createUserDetails);
router.get('/detail/:userId', userDetailController.getUserDetailsByUserId);
router.put('/detail/:userId', authMiddleware, userDetailController.updateUserDetailsByUserId);

router.get('/public-profile/:userId', userDetailController.getPublicProfileByUserId);

router.get('/aadhaarVerificationStatus', authMiddleware, userDetailController.getAadhaarVerificationStatus);
router.put('/updateAadhaarDetails', authMiddleware, userDetailController.updateAadhaarDetails);

router.post('/updateTermsAndCondition', authMiddleware, userDetailController.updateTermsAndCondition);
router.get('/getTermsAndCondition', userDetailController.getTermsAndCondition);


module.exports = router;
