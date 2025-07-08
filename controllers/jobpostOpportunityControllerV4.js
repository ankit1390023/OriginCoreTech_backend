const { JobPost, UserSkill, User, CompanyRecruiterProfile, sequelize } = require('../models');
const { Op } = require('sequelize');


exports.getOpportunities = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID not found." });
    }

    // Fetch user skills
    const userSkillsData = await UserSkill.findAll({
      where: { userId },
      attributes: ['skill']
    });
    const userSkills = userSkillsData.map(us => us.skill.toLowerCase());

    // Fetch job posts including CompanyRecruiterProfile by companyRecruiterProfileId
    const jobPosts = await JobPost.findAll({
      include: [
        {
          model: CompanyRecruiterProfile,
          attributes: ['companyName', 'logoUrl'],
          required: false
        }
      ]
    });

    const currentDate = new Date();
    const opportunities = jobPosts.map(job => {
      // Parse job skillsRequired string into array
      const jobSkills = job.skillsRequired ? job.skillsRequired.split(',').map(s => s.trim().toLowerCase()) : [];

      // Calculate intersection count
      const matchedSkillsCount = jobSkills.filter(skill => userSkills.includes(skill)).length;

      // Calculate matchPercentage
      const matchPercentage = jobSkills.length > 0 ? (matchedSkillsCount / jobSkills.length) * 100 : 0;

      // Calculate hiringStatus
      const hiringStatus = job.numberOfOpenings > 0 ? "Actively Hiring" : "Closed";

      // Calculate postedDaysAgo from createdAt
      const postedDate = job.createdAt;
      const diffTime = Math.abs(currentDate - postedDate);
      let postedDaysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (postedDaysAgo === 0) {
        postedDaysAgo = "Today";
      } else {
        postedDaysAgo = postedDaysAgo.toString();
      }

      // Experience - using candidatePreferences as placeholder (adjust if needed)
      const experience = job.candidatePreferences || "";

      // Salary - using stipendMin and stipendMax
      const salary = job.stipendMin && job.stipendMax ? `${job.stipendMin} - ${job.stipendMax}` : "";
      return {
jobId: job.jobId,
      companyRecruiterProfileId: job.companyRecruiterProfileId,
      opportunityType: job.opportunityType,
      skillsRequired: job.skillsRequired,
      skillRequiredNote: job.skillRequiredNote,
      jobType: job.jobType,
      jobTime: job.jobTime,
      daysInOffice: job.daysInOffice,
      cityChoice: job.cityChoice,
      numberOfOpenings: job.numberOfOpenings,
      jobDescription: job.jobDescription,
      candidatePreferences: job.candidatePreferences,
      womenPreferred: job.womenPreferred,
      stipendType: job.stipendType,
      stipendMin: job.stipendMin,
      stipendMax: job.stipendMax,
      incentivePerYear: job.incentivePerYear,
      perks: job.perks,
      screeningQuestions:job.screeningQuestions,
      phoneContact: job.phoneContact,
      internshipDuration: job.internshipDuration,
      internshipStartDate: job.internshipStartDate,
      internshipFromDate: job.internshipFromDate,
      internshipToDate: job.internshipToDate,
      isCustomInternshipDate: job.isCustomInternshipDate ,
      collegeName: job.collegeName || "",
      course: job.course || "",
      alternatePhoneNumber: job.alternatePhoneNumber || "",
      views: job.views || 0,
      userId: job.userId,
        jobProfile: job.jobProfile,
        companyName: job.CompanyRecruiterProfile ? job.CompanyRecruiterProfile.companyName : "",
        logoUrl: job.CompanyRecruiterProfile ? job.CompanyRecruiterProfile.logoUrl : "",
        hiringStatus,
        postedDaysAgo,
        matchPercentage: Math.round(matchPercentage),
        experience,
        salary
      };
    });

    return res.status(200).json({ data: opportunities });

  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getJobDetails = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required." });
    }

    const job = await JobPost.findOne({
      where: { jobId: jobId },
      include: [
        {
          model: CompanyRecruiterProfile,
          attributes: ['companyName', 'logoUrl', 'about'],
          required: false
        }
      ]
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    const currentDate = new Date();

    // Calculate postedDaysAgo from createdAt
    const postedDate = job.createdAt;
    const diffTime = Math.abs(currentDate - postedDate);
    let postedDaysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
     if (postedDaysAgo === 0) {
      postedDaysAgo = "Today";
    } else {
      postedDaysAgo = postedDaysAgo.toString();
    }

    job.companyName=job.CompanyRecruiterProfile ? job.CompanyRecruiterProfile.companyName : "";
    job.logoUrl=job.CompanyRecruiterProfile ? job.CompanyRecruiterProfile.logoUrl : "";
    job.aboutCompany=job.CompanyRecruiterProfile ? job.CompanyRecruiterProfile.about : "",
    job.hiringStatus=job.numberOfOpenings > 0 ? "Actively Hiring" : "Closed";
    job.postedDaysAgo=postedDaysAgo;
    job.experience=job.candidatePreferences || "";
    job.salary=job.stipendMin && job.stipendMax ? `${job.stipendMin} - ${job.stipendMax}` : "";
    job.location=job.jobLocation || "";
    job.numberOfApplicants=job.applicantsCount || 0;
    job.userRole=job.jobDescription || "";

    return res.status(200).json(job);

  } catch (error) {
    console.error("Error fetching job details:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.showCompanyWiseJobPosts = async (req, res) => {
  try {
    const companyNameQuery = req.query.companyName;

    if (!companyNameQuery) {
      return res.status(400).json({ message: "companyName query parameter is required." });
    }

    // Find company recruiter profiles matching the company name (case-insensitive, partial match)
    // Use Sequelize.fn and Op.like for case-insensitive search in MySQL
    const matchingCompanies = await CompanyRecruiterProfile.findAll({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('companyName')),
        {
          [Op.like]: `%${companyNameQuery.toLowerCase()}%`
        }
      ),
      attributes: ['id', 'companyName', 'logoUrl']
    });

    if (matchingCompanies.length === 0) {
      return res.status(404).json({ message: "No companies found matching the given name." });
    }

    const companyIds = matchingCompanies.map(company => company.id);

    // Fetch job posts for the matching companies
    const jobPosts = await JobPost.findAll({
      where: {
        companyRecruiterProfileId: {
          [Op.in]: companyIds
        }
      },
      include: [
        {
          model: CompanyRecruiterProfile,
          attributes: ['companyName', 'logoUrl']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const currentDate = new Date();

    // Format the response data
    const responseData = jobPosts.map(job => {
      // Calculate postedDaysAgo
      const postedDate = job.createdAt;
      const diffTime = Math.abs(currentDate - postedDate);
      let postedDaysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (postedDaysAgo === 0) {
        postedDaysAgo = "Today";
      } else {
        postedDaysAgo = `${postedDaysAgo} days ago`;
      }

      // Hiring status
      const hiringStatus = job.numberOfOpenings > 0 ? "Actively Hiring" : "Closed";

      // Salary range
      const salary = (job.stipendMin && job.stipendMax) ? `${job.stipendMin} - ${job.stipendMax}` : "";

      return {
        companyName: job.CompanyRecruiterProfile ? job.CompanyRecruiterProfile.companyName : "",
        logoUrl: job.CompanyRecruiterProfile ? job.CompanyRecruiterProfile.logoUrl : "",
        jobRole: job.jobProfile || "",
        experience: job.candidatePreferences || "",
        city: job.cityChoice || "",
        salary,
        postedDaysAgo,
        hiringStatus
      };
    });

    return res.status(200).json({ data: responseData });

  } catch (error) {
    console.error("Error fetching company-wise job posts:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

