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

// get the all aplicant detail whcih aplly for specific job it for recuriter
router.get('/api/jobpost/:jobPostId/allapplicant', authMiddleware, jobPostController.getApplicantsForJob);

// get the all aplicant (fulldetail) whcih aplly for specific job it for recuriter
router.get('/api/jobpost/:jobPostId/applicant/:applicationId', authMiddleware, jobPostController.getApplicantDetailsById);

// New route to update application status by recruiter
router.patch('/api/application/status', authMiddleware, jobPostController.updateApplicationStatus);

// New route to get candidates by application status
router.get('/api/applications/status/:status', authMiddleware, jobPostController.getCandidatesByStatus);

// api for pending count
router.get('/api/pendingtask/grouped',authMiddleware,jobPostController.getPendingTasksgroupbystatus);
// api for pending view
router.get('/api/pendingtask/:status', authMiddleware, jobPostController.getviewPendingTasksgroupbystatus);


module.exports = router;
