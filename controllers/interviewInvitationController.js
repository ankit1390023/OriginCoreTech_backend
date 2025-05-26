const { InterviewInvitation, Application, JobPost } = require('../models');
const { Op } = require('sequelize');

const sendInterviewInvitation = async (req, res) => {
  try {
    const {
      message,
      interviewType,
      interviewDate,
      interviewTime,
      videoLink,
    } = req.body;

    const { applicationId } = req.params;

    // Validate required fields
    if (!applicationId || !message || !interviewType || !interviewDate || !interviewTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if application exists
    const application = await Application.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Create interview invitation
    const interviewInvitation = await InterviewInvitation.create({
      applicationId,
      name: application.name,
      message,
      interviewType,
      interviewDate,
      interviewTime,
      videoLink,
    });
await application.update({ status: 'Interview' });

    // Prepare response including name (firstname) from application
    const response = {
      id: interviewInvitation.id,
      applicationId: application.applicationId,
      name: application.name, // using full name as firstname
      jobId: application.jobPostId,
      message: interviewInvitation.message,
      interviewType: interviewInvitation.interviewType,
      interviewDate: interviewInvitation.interviewDate,
      interviewTime: interviewInvitation.interviewTime,
      videoLink: interviewInvitation.videoLink,
      createdAt: interviewInvitation.createdAt,
      updatedAt: interviewInvitation.updatedAt,
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Error sending interview invitation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const fetchUpcomingInterviews = async (req, res) => {
  try {
    const filterType = req.params.filterType;
    const { startDate, endDate } = req.query;
    const today = new Date();
    let dateFilter = {};

    if (filterType === 'today') {
      const todayStr = today.toISOString().split('T')[0];
      dateFilter = {
        interviewDate: todayStr,
      };
    } else if (filterType === 'thisWeek') {
      // Calculate start and end of current week (Monday to Sunday)
      const dayOfWeek = today.getDay(); // Sunday - Saturday : 0 - 6
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const mondayStr = monday.toISOString().split('T')[0];
      const sundayStr = sunday.toISOString().split('T')[0];

      dateFilter = {
        interviewDate: {
          [Op.between]: [mondayStr, sundayStr],
        },
      };
    } else if (filterType === 'custom' && startDate && endDate) {
      dateFilter = {
        interviewDate: {
          [Op.between]: [startDate, endDate],
        },
      };
    } else {
      // Default: upcoming from today onwards
      const todayStr = today.toISOString().split('T')[0];
      dateFilter = {
        interviewDate: {
          [Op.gte]: todayStr,
        },
      };
    }

    const interviews = await InterviewInvitation.findAll({
      where: dateFilter,
      include: [
        {
          model: Application,
          attributes: ['name'],
          include: [
            {
              model: JobPost,
              attributes: ['jobProfile'],
            },
          ],
        },
      ],
      attributes: ['interviewType', 'interviewTime', 'interviewDate'],
      order: [['interviewDate', 'ASC'], ['interviewTime', 'ASC']],
    });

    const result = interviews.map((interview) => ({
      interviewType: interview.interviewType,
      interviewTime: interview.interviewTime,
      interviewDate: interview.interviewDate,
      name: interview.Application ? interview.Application.name : interview.name,
      jobProfile: interview.Application && interview.Application.JobPost ? interview.Application.JobPost.jobProfile : null,
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching upcoming interviews:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  sendInterviewInvitation,
  fetchUpcomingInterviews,
};
