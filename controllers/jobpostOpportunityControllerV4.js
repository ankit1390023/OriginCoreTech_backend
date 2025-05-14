const { JobPost, UserSkill, User, CompanyRecruiterProfile } = require('../models');

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

    // Location
    const location = job.jobLocation || "";

    // Number of applicants - assuming job.applicantsCount field or count from another model (not implemented here)
    const numberOfApplicants = job.applicantsCount || 0;

    // User role (intern responsibility) - assuming job.internResponsibility field
    const userRole = job.jobDescription || "";

    return res.status(200).json({
      jobProfile: job.jobProfile,
      companyName: job.CompanyRecruiterProfile ? job.CompanyRecruiterProfile.companyName : "",
      logoUrl: job.CompanyRecruiterProfile ? job.CompanyRecruiterProfile.logoUrl : "",
      aboutCompany: job.CompanyRecruiterProfile ? job.CompanyRecruiterProfile.about : "",
      hiringStatus,
      postedDaysAgo,
      experience,
      salary,
      location,
      numberOfApplicants,
      userRole,
    });

  } catch (error) {
    console.error("Error fetching job details:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
