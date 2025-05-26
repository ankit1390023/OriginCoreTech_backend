const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationRead } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Get notifications for logged-in company recruiter
router.get('/', authMiddleware, getNotifications);

// Mark a notification as read
router.put('/:id/read', authMiddleware, markNotificationRead);

module.exports = router;
