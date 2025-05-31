const express = require('express');
const router = express.Router();
const universitydetailController = require('../controllers/universitydetailController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to create university detail
router.post('/universitydetail', authMiddleware, universitydetailController.createUniversityDetail);

// Route to update university detail
router.put('/universitydetail', authMiddleware, universitydetailController.updateUniversityDetail);

// Route to get university detail by id
router.get('/universitydetail/:id', authMiddleware, universitydetailController.getUniversityDetailById);

module.exports = router;
