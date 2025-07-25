const { User, JobPost, UserDetail, UserSkill, CompanyRecruiterProfile, Domain } = require('../models');
const Application = require('../models/application');
const { Op, fn, col, literal, Sequelize, where } = require('sequelize');


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
      alternatePhoneNumber,
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
      alternatePhoneNumber,
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

exports.getAllDomains = async (req, res) => {
  try {
    const domains = await Domain.findAll({
      attributes: ['domain_name']
    });
    const domainNames = domains.map(domain => domain.domain_name);
    return res.status(200).json({ "domains": domainNames });
  } catch (error) {
    console.error("Error fetching domains:", error);
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
      name: userDetail?.firstName || '',
      location: userDetail?.currentLocation || '',
      experience: userDetail?.totalExperience || '',
      skills: userSkills.map(skill => skill.skill).join(', '),
      language: userDetail?.language || '',
      resume: userDetail?.resume || '',
      email: user?.email || '',
      phoneNumber: user?.phone || '',
      status: 'Applied'  // default status on application creation
    });

    return res.status(200).json({ message: "Application successful.", data: application });

  } catch (error) {
    console.error("Error applying for job:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



// New method to update application status by recruiter
exports.updateApplicationStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { applicationId, jobPostId, userId: applicantUserId, status } = req.body;

    // Validate user is recruiter
    const recruiter = await User.findOne({ where: { id: userId, userRole: 'COMPANY' } });
    if (!recruiter) {
      return res.status(403).json({ message: "Unauthorized. Only recruiters can update application status." });
    }

    // Validate status value
    const allowedStatuses = ['Applied', 'Screening', 'Interview', 'Offered', 'Hired', 'ShortList', 'NotInterested', 'Send Assignment'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status value. Allowed values are: ${allowedStatuses.join(', ')}` });
    }

    // Find application by applicationId or by userId and jobPostId
    let application;
    if (applicationId) {
      application = await Application.findOne({ where: { id: applicationId } });
    } else if (jobPostId && applicantUserId) {
      application = await Application.findOne({ where: { jobPostId, userId: applicantUserId } });
    } else {
      return res.status(400).json({ message: "Provide either applicationId or both jobPostId and userId of the applicant." });
    }

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Update status
    application.status = status;
    await application.save();

    return res.status(200).json({ message: "Application status updated successfully.", data: application });

  } catch (error) {
    console.error("Error updating application status:", error);
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

// New method to get candidates by application status
exports.getCandidatesByStatus = async (req, res) => {
  try {
    const status = req.params.status;

    // Validate status value
    const allowedStatuses = ['Applied', 'Screening', 'Interview', 'Offered', 'Hired', 'ShortList', 'NotInterested', 'Send Assignment'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status value. Allowed values are: ${allowedStatuses.join(', ')}` });
    }

    // Fetch applications with the given status
    const applications = await Application.findAll({
      where: { status },
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

    // Format response data to include all application fields
    const responseData = applications.map(app => ({
      applicationId: app.id,
      userId: app.userId,
      jobPostId: app.jobPostId,
      status: app.status,
      applyTime: app.createdAt,
      name: app.name,
      experience: app.experience,
      jobProfile: app.JobPost.jobProfile,

    }));

    return res.status(200).json({ candidates: responseData });

  } catch (error) {
    console.error("Error fetching candidates by status:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  user application view
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

// applicant detail
exports.getApplicantDetailsById = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;

    if (!applicationId) {
      return res.status(400).json({ message: "Application ID is required." });
    }

    // Fetch application by ID
    const application = await Application.findOne({
      where: { id: applicationId }
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }
    // Return full details of the applicant's application
    return res.status(200).json({
      applicationId: application.id,
      userId: application.userId,
      jobPostId: application.jobPostId,
      applyTime: application.createdAt,
      status: application.status,
      applicationDetails: {
        whyShouldWeHireYou: application.whyShouldWeHireYou,
        confirmAvailability: application.confirmAvailability,
        project: application.project,
        githubLink: application.githubLink,
        portfolioLink: application.portfolioLink,
        education: application.education,
        name: application.name,
        location: application.location,
        experience: application.experience,
        skills: application.skills,
        language: application.language,
        resume: application.resume,
        email: application.email,
        phoneNumber: application.phoneNumber
      }
    });

  } catch (error) {
    console.error("Error fetching applicant details:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// get the all apllicant which apply for jobspecific 
exports.getApplicantsForJob = async (req, res) => {
  try {
    const jobPostId = req.params.jobPostId;

    if (!jobPostId) {
      return res.status(400).json({ message: "Job post ID is required." });
    }

    // Fetch the job post to get required skills
    const jobPost = await JobPost.findOne({ where: { jobId: jobPostId } });
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found." });
    }

    // Parse job skills from skillsRequired string (assuming comma separated)
    const jobSkills = jobPost.skillsRequired ? jobPost.skillsRequired.split(',').map(skill => skill.trim().toLowerCase()) : [];

    // Fetch all applications for the given jobPostId
    const applications = await Application.findAll({
      where: { jobPostId },
      order: [['createdAt', 'DESC']]
    });

    // Format response data with applicant details, application time, and calculated match percentage
    const responseData = applications.map(app => {
      // Parse applicant skills
      const applicantSkills = app.skills ? app.skills.split(',').map(skill => skill.trim().toLowerCase()) : [];

      // Calculate matched skills count
      const matchedSkillsCount = jobSkills.filter(skill => applicantSkills.includes(skill)).length;

      // Calculate match percentage
      const matchPercentage = jobSkills.length > 0 ? (matchedSkillsCount / jobSkills.length) * 100 : 0;

      return {
        applicationId: app.id,
        userId: app.userId,
        applyTime: app.createdAt,
        matchPercentage: Math.round(matchPercentage * 100) / 100, // rounded to 2 decimals
        applicationDetails: {
          name: app.name,
          location: app.location,
          experience: app.experience,
        }
      };
    });

    return res.status(200).json({ applicants: responseData });

  } catch (error) {
    console.error("Error fetching applicants for job:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// api for pending task  count
exports.getPendingTasksgroupbystatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log("getPendingTasksgroupbystatus - userId:", userId);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID not found." });
    }

    const companyRecruiterProfile = await CompanyRecruiterProfile.findOne({ where: { userId } });
    if (!companyRecruiterProfile) {
      return res.status(404).json({ message: "Company recruiter profile not found." });
    }

    const jobPosts = await JobPost.findAll({
      where: { companyRecruiterProfileId: companyRecruiterProfile.id }
    });

    const jobPostIds = jobPosts.map(job => job.jobId);

    if (jobPostIds.length === 0) {
      return res.status(200).json({
        resumeReview: [],
        interviewToSchedule: [],
        offerLetterPending: []
      });
    }

    const applications = await Application.findAll({
      where: {
        jobPostId: { [Op.in]: jobPostIds }
      },
      order: [['createdAt', 'DESC']]
    });

    const resumeReview = [];
    const interviewToSchedule = [];
    const offerLetterPending = [];

    applications.forEach(app => {
      const statusTrimmed = app.status.trim();
      if (statusTrimmed === 'Applied') {
        resumeReview.push(app);
      } else if (statusTrimmed === 'ShortList') {
        interviewToSchedule.push(app);
      } else if (statusTrimmed === 'Hired') {
        offerLetterPending.push(app);
      }
    });

    return res.status(200).json({
      resumeReview: {
        count: resumeReview.length,

      },
      interviewToSchedule: {
        count: interviewToSchedule.length,

      },
      offerLetterPending: {
        count: offerLetterPending.length,

      }
    });

  } catch (error) {
    console.error("Error fetching pending tasks grouped by status:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};



//view pending task Applications by status
exports.getviewPendingTasksgroupbystatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    const statusParam = req.params.status?.trim();

    const validStatuses = ["Applied", "ShortList", "Hired"];

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }

    if (!validStatuses.includes(statusParam)) {
      return res.status(400).json({ message: `Invalid status '${statusParam}'. Must be one of: ${validStatuses.join(", ")}` });
    }

    const recruiter = await CompanyRecruiterProfile.findOne({ where: { userId } });
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter profile not found" });
    }

    const jobPosts = await JobPost.findAll({
      where: { companyRecruiterProfileId: recruiter.id }
    });

    const jobPostIds = jobPosts.map(job => job.jobId);

    if (jobPostIds.length === 0) {
      return res.status(200).json({ applications: [] });
    }

    const applications = await Application.findAll({
      where: {
        jobPostId: { [Op.in]: jobPostIds },
        status: statusParam
      },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      status: statusParam,
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error("Error in getviewPendingTasksgroupbystatus:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// api for filter 
exports.getAllJobFilterOptions = async (req, res) => {
  try {
    const [
      jobProfiles,
      cityChoices,
      jobTypes,
      candidatePreferences,
      salaryRanges,
      companyNames
    ] = await Promise.all([
      JobPost.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('jobProfile')), 'jobProfile']],
        where: { jobProfile: { [Op.ne]: null } },
        order: [['jobProfile', 'ASC']]
      }),
      JobPost.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('cityChoice')), 'cityChoice']],
        where: { cityChoice: { [Op.ne]: null } },
        order: [['cityChoice', 'ASC']]
      }),
      JobPost.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('jobType')), 'jobType']],
        where: { jobType: { [Op.ne]: null } },
        order: [['jobType', 'ASC']]
      }),
      JobPost.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('candidatePreferences')), 'candidatePreferences']],
        where: { candidatePreferences: { [Op.ne]: null } },
        order: [['candidatePreferences', 'ASC']]
      }),
      JobPost.findAll({
        attributes: [
          [Sequelize.fn('MIN', Sequelize.col('stipendMin')), 'minSalary'],
          [Sequelize.fn('MAX', Sequelize.col('stipendMax')), 'maxSalary']
        ]
      }),
      CompanyRecruiterProfile.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('companyName')), 'companyName']],
        where: {
          companyName: {
            [Op.and]: [
              { [Op.ne]: null },
              { [Op.ne]: '' }
            ]
          }
        },
        order: [['companyName', 'ASC']]
      })
    ]);

    return res.status(200).json({
      jobProfiles: jobProfiles.map(jp => jp.jobProfile),
      cityChoices: cityChoices.map(c => c.cityChoice),
      jobTypes: jobTypes.map(jt => jt.jobType),
      candidatePreferences: candidatePreferences.map(cp => cp.candidatePreferences),
      salaryRanges: salaryRanges[0],
      companyNames: companyNames.map(cn => cn.companyName)
    });

  } catch (error) {
    console.error("Error fetching filter options:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// filter job post 
const normalize = (str) => (typeof str === 'string' ? str.trim().toLowerCase() : '');

exports.filterJobPosts = async (req, res) => {
  try {
    const {
      jobProfile,
      cityChoice,
      jobType,
      candidatePreferences,
      stipendMin,
      stipendMax,
      companyName,
      limit = 10,
      offset = 0
    } = req.query;

    const whereConditions = {};

    if (jobProfile) {
      whereConditions.jobProfile = where(
        fn('LOWER', col('jobProfile')),
        {
          [Op.like]: `%${normalize(jobProfile)}%`
        }
      );
    }

    if (cityChoice) {
      whereConditions.cityChoice = where(
        fn('LOWER', col('cityChoice')),
        {
          [Op.like]: `%${normalize(cityChoice)}%`
        }
      );
    }

    if (jobType) {
      whereConditions.jobType = where(
        fn('LOWER', col('jobType')),
        {
          [Op.like]: `%${normalize(jobType)}%`
        }
      );
    }

    if (candidatePreferences) {
      whereConditions.candidatePreferences = where(
        fn('LOWER', col('candidatePreferences')),
        {
          [Op.like]: `%${normalize(candidatePreferences)}%`
        }
      );
    }

    if (stipendMin && stipendMax) {
      whereConditions.stipendMin = { [Op.gte]: Number(stipendMin) };
      whereConditions.stipendMax = { [Op.lte]: Number(stipendMax) };
    } else if (stipendMin) {
      whereConditions.stipendMin = { [Op.gte]: Number(stipendMin) };
    } else if (stipendMax) {
      whereConditions.stipendMax = { [Op.lte]: Number(stipendMax) };
    }

    // Filter for associated company name
    const companyInclude = {
      model: CompanyRecruiterProfile,
      attributes: ['companyName']
    };

    if (companyName) {
      companyInclude.where = where(
        fn('LOWER', col('CompanyRecruiterProfile.companyName')),
        {
          [Op.like]: `%${normalize(companyName)}%`
        }
      );
    }

    // Fetch filtered job posts
    const jobPosts = await JobPost.findAll({
      where: whereConditions,
      include: [companyInclude],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Count for pagination
    const totalCount = await JobPost.count({
      where: whereConditions,
      include: companyName ? [companyInclude] : []
    });

    return res.status(200).json({ jobPosts, totalCount });

  } catch (error) {
    console.error('Error filtering job posts:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
