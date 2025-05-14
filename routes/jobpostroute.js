const express = require('express');
const router = express.Router();
const jobPostController = require('../controllers/jobpostController');
const jobPostOpportunityControllerV4 = require('../controllers/jobpostOpportunityControllerV4');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/api/jobpost/create', authMiddleware, jobPostController.createJobPost);
router.post('/api/jobpost/apply/:jobPostId', authMiddleware, jobPostController.applyForJob);
router.get('/api/opportunities', authMiddleware, jobPostOpportunityControllerV4.getOpportunities);
router.get('/api/jobdetails/:jobId', authMiddleware, jobPostOpportunityControllerV4.getJobDetails);

// New route to get all applications of the authenticated user
router.get('/api/user/applications', authMiddleware, jobPostController.getUserApplications);

module.exports = router;
