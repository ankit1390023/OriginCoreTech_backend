const { User, JobPost, UserDetail, UserSkill, CompanyRecruiterProfile } = require('../models');
const Application = require('../models/application');
const { Op, fn, col, literal, Sequelize } = require('sequelize');





exports.createJobPost = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID not found." });
    }

    const {
      opportunityType,
      jobProfile,
      skillsRequired,
      skillRequiredNote,
      jobType,
      daysInOffice,
      jobTime,
      cityChoice,
      numberOfOpenings,
      jobDescription,
      candidatePreferences,
      womenPreferred,
      stipendType,
      stipendMin,
      stipendMax,
      incentivePerYear,
      perks,
      screeningQuestions,
      phoneContact,
      internshipDuration,
      internshipStartDate,
      internshipFromDate,
      internshipToDate,
      isCustomInternshipDate,
      collegeName,
      course
    } = req.body;

    // Fetch companyRecruiterProfileId for the userId
    const companyRecruiterProfile = await CompanyRecruiterProfile.findOne({
      where: { userId }
    });

    if (!companyRecruiterProfile) {
      return res.status(400).json({ message: "Company recruiter profile not found for user." });
    }

    const jobPost = await JobPost.create({
      companyRecruiterProfileId: companyRecruiterProfile.id,
      opportunityType,
      jobProfile,
      skillsRequired,
      skillRequiredNote,
      jobType,
      daysInOffice: jobType === 'Remote' ? null : daysInOffice,
      jobTime,
      cityChoice: jobType === 'Remote' ? null : cityChoice,
      numberOfOpenings,
      jobDescription,
      candidatePreferences,
      womenPreferred,
      stipendType,
      stipendMin: stipendType === 'Unpaid' ? null : stipendMin,
      stipendMax: stipendType === 'Unpaid' ? null : stipendMax,
      incentivePerYear,
      perks,
      screeningQuestions,
      phoneContact,
      internshipDuration,
      internshipStartDate,
      internshipFromDate: isCustomInternshipDate ? internshipFromDate : null,
      internshipToDate: isCustomInternshipDate ? internshipToDate : null,
      isCustomInternshipDate,
      collegeName,
      course
    });

    return res.status(201).json({ message: 'Job post created successfully.', data: jobPost });

  } catch (error) {
    console.error("Error creating job post:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



exports.applyForJob = async (req, res) => {
  try {
    const userId = req.user?.id;
    const jobPostId = req.params.jobPostId;
    const {
      whyShouldWeHireYou,
      confirmAvailability,
      project,
      githubLink,
      portfolioLink,
      education
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID not found." });
    }

    if (!jobPostId) {
      return res.status(400).json({ message: "Job post ID is required." });
    }

    // Validate required fields
    if (!whyShouldWeHireYou || !confirmAvailability || !project || !githubLink || !portfolioLink) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    // Fetch user details to check Aadhaar verification and get profile info
    const userDetail = await UserDetail.findOne({ where: { userId } });
    const user = await User.findOne({ where: { id: userId } });
    const userSkills = await UserSkill.findAll({ where: { userId } });

    if (!userDetail) {
      return res.status(404).json({ message: "User details not found." });
    }

    if (!userDetail.isAadhaarVerified) {
      return res.status(403).json({ message: "Aadhaar is not verified. Please verify Aadhaar before applying." });
    }

    // Check if user already applied for this job
    const existingApplication = await Application.findOne({
      where: {
        userId,
        jobPostId
      }
    });

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this job." });
    }

    // Create application record
    const application = await Application.create({
      userId,
      jobPostId,
      whyShouldWeHireYou,
      confirmAvailability,
      project,
      githubLink,
      portfolioLink,
      education,
      name: user?.firstName || '',
      location: userDetail?.currentLocation || '',
      experience: userDetail?.totalExperience || '',
      skills: userSkills.map(skill => skill.skill).join(', '),
      language: userDetail?.language || '',
      resume: userDetail?.resume || '',
      email: user?.email || '',
      phoneNumber: user?.phone || ''
    });

    return res.status(200).json({ message: "Application successful.", data: application });

  } catch (error) {
    console.error("Error applying for job:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



// New method to get total job posts count by recruiter
exports.getTotalJobPostsByRecruiter = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID not found." });
    }

    // Check if user role is COMPANY (recruiter)
    const user = await User.findOne({ where: { id: userId, userRole: 'COMPANY' } });
    if (!user) {
      return res.status(403).json({ message: "Unauthorized. User is not a recruiter." });
    }

    // Find company recruiter profile
    const companyRecruiterProfile = await CompanyRecruiterProfile.findOne({ where: { userId } });
    if (!companyRecruiterProfile) {
      return res.status(404).json({ message: "Company recruiter profile not found." });
    }

    // Count job posts by companyRecruiterProfileId
    const totalJobPosts = await JobPost.count({
      where: { companyRecruiterProfileId: companyRecruiterProfile.id }
    });

    return res.status(200).json({ totalJobPosts });

  } catch (error) {
    console.error("Error fetching total job posts:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



// user application view
exports.getUserApplications = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID not found." });
    }

    // Fetch all applications for the user with job post and company details
    const applications = await Application.findAll({
      where: { userId },
      include: [
        {
          model: JobPost,
          include: [
            {
              model: CompanyRecruiterProfile,
              attributes: ['companyName']
            }
          ],
          attributes: ['jobId', 'jobProfile', 'skillsRequired', 'numberOfOpenings']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // For each application, get the number of applicants for the job post
    const jobPostIds = applications.map(app => app.jobPostId);
    const applicantCounts = await Application.findAll({
      where: { jobPostId: { [Op.in]: jobPostIds } },
      attributes: ['jobPostId', [fn('COUNT', col('id')), 'applicantCount']],
      group: ['jobPostId']
    });

    // Map jobPostId to applicantCount
    const applicantCountMap = {};
    applicantCounts.forEach(item => {
      applicantCountMap[item.jobPostId] = item.get('applicantCount');
    });

    // Format response data
    const responseData = applications.map(app => ({
      applicationId: app.id,
      companyName: app.JobPost.CompanyRecruiterProfile?.companyName || '',
      jobProfile: app.JobPost.jobProfile,
      skillsRequired: app.JobPost.skillsRequired,
      numberOfOpenings: app.JobPost.numberOfOpenings,
      status: app.status || 'application sent', // default status if not present
      applicantCount: applicantCountMap[app.jobPostId] || 0,
      applyTime: app.createdAt,
      applicationDetails: {
        whyShouldWeHireYou: app.whyShouldWeHireYou,
        confirmAvailability: app.confirmAvailability,
        project: app.project,
        githubLink: app.githubLink,
        portfolioLink: app.portfolioLink,
        education: app.education,
        name: app.name,
        location: app.location,
        experience: app.experience,
        skills: app.skills,
        language: app.language,
        resume: app.resume,
        email: app.email,
        phoneNumber: app.phoneNumber
      }
    }));

    return res.status(200).json({ applications: responseData });

  } catch (error) {
    console.error("Error fetching user applications:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


