const express = require('express');
const router = express.Router();
const jobPostController = require('../controllers/jobpostController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/api/jobpost/create', authMiddleware, jobPostController.createJobPost);

module.exports = router;