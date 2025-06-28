const { Assignment, Application, User, JobPost } = require('../models');
const path = require('path');
const fs = require('fs');

const createAssignment = async (req, res) => {
  try {
    const { message, deadline } = req.body;
    const { applicationId } = req.params;

    // Validate required fields
    if (!applicationId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let fileUpload = null;
    if (req.file) {
      fileUpload = req.file.filename; // assuming multer middleware is used for file upload
    }

    // Fetch Application to get jobPostId and userId and confirm application exists
    const application = await Application.findOne({ where: { id: applicationId } });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const jobPostId = application.jobPostId;
    const userId = application.userId;

    // Validate user existence to avoid foreign key constraint error
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid userId associated with the application' });
    }

    const assignment = await Assignment.create({
      userId,
      jobPostId,
      applicationId,
      message,
      deadline,
      name: application.name,
      fileUpload,
    });
    await application.update({ status: 'Send Assignment' });


    // Prepare response similar to interviewInvitationController
    const response = {
      id: assignment.id,
      applicationId: assignment.applicationId,
      name: assignment.name,
      jobId: assignment.jobPostId,
      message: assignment.message,
      deadline: assignment.deadline,
      fileUpload: assignment.fileUpload,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createAssignment };

