const express = require('express');
const router = express.Router();
const { createProfile, getProfile, updateProfile } = require('../controllers/companyRecruiterProfileController');
const authMiddleware = require('../middleware/authMiddleware');

// Create recruiter profile
router.post('/profile', authMiddleware, createProfile);

// Get recruiter profile
router.get('/profile', authMiddleware, getProfile);

// Update recruiter profile
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
