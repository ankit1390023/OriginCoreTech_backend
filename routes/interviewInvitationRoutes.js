const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { sendInterviewInvitation, fetchUpcomingInterviews } = require('../controllers/interviewInvitationController');


// Use applicationId as URL param and protect route with auth middleware
router.post('/:applicationId', authMiddleware, sendInterviewInvitation);

router.get('/upcoming/:filterType', authMiddleware, fetchUpcomingInterviews);

module.exports = router;
