const express = require('express');
const router = express.Router();
const { createProfile, getProfile, updateProfile, getJobPostsByRecruiter, incrementViewCount, updateExperienceStatus, upload, handleUploadError } = require('../controllers/companyRecruiterProfileController');
const authMiddleware = require('../middleware/authMiddleware');

// Create recruiter profile with file upload support (new)
router.post('/profile/upload', authMiddleware, upload, handleUploadError, createProfile);

// Create recruiter profile without file upload (backward compatibility)
router.post('/profile', authMiddleware, createProfile);

// Get recruiter profile
router.get('/profile', authMiddleware, getProfile);

// Update recruiter profile with file upload support (new)
router.put('/profile/upload', authMiddleware, upload, handleUploadError, updateProfile);

// Update recruiter profile without file upload (backward compatibility)
router.put('/profile', authMiddleware, updateProfile);

// New route to get detailed list of job posts by recruiter
router.get('/jobpost/list', authMiddleware, getJobPostsByRecruiter);

// incremnt views
router.post('/jobpost/:jobId/increment-view', incrementViewCount);

// New route to update experience status by company recruiter
router.put('/experience/:experienceId/status', authMiddleware, updateExperienceStatus);

module.exports = router;
