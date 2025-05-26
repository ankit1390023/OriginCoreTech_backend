const express = require('express');
const router = express.Router();
const { createProfile, getProfile, updateProfile,getJobPostsByRecruiter,incrementViewCount, updateExperienceStatus } = require('../controllers/companyRecruiterProfileController');
const authMiddleware = require('../middleware/authMiddleware');

// Create recruiter profile
router.post('/profile', authMiddleware, createProfile);

// Get recruiter profile
router.get('/profile', authMiddleware, getProfile);

// Update recruiter profile
router.put('/profile', authMiddleware, updateProfile);
// New route to get detailed list of job posts by recruiter
router.get('/jobpost/list', authMiddleware, getJobPostsByRecruiter);

// incremnt views
router.post('/jobpost/:jobId/increment-view', incrementViewCount);

// New route to update experience status by company recruiter
router.put('/experience/:experienceId/status', authMiddleware, updateExperienceStatus);

module.exports = router;
