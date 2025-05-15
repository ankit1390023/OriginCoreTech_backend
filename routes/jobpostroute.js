const express = require('express');
const router = express.Router();
const jobPostController = require('../controllers/jobpostController');
const { getOpportunities, getJobDetails, showCompanyWiseJobPosts } = require('../controllers/jobpostOpportunityControllerV4');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/api/jobpost/create', authMiddleware, jobPostController.createJobPost);
router.post('/api/jobpost/apply/:jobPostId', authMiddleware, jobPostController.applyForJob);

router.get('/api/opportunities', authMiddleware, getOpportunities);
router.get('/api/jobdetails/:jobId', authMiddleware, getJobDetails);
router.get('/api/jobposts/companysearch', showCompanyWiseJobPosts);


// New route to get all applications of the authenticated user
router.get('/api/user/applications', authMiddleware, jobPostController.getUserApplications);

// New route to get total job posts count by recruiter
router.get('/api/jobpost/totalcount', authMiddleware, jobPostController.getTotalJobPostsByRecruiter);

module.exports = router;
