const multer = require('multer');
const path = require('path');
const { User, CompanyRecruiterProfile, JobPost, } = require('../models');
const Application = require('../models/application');
const { Op, fn, col, literal, Sequelize } = require('sequelize');
const { Experience } = require('../models');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create different folders for different file types
    if (file.fieldname === 'profilePic') {
      cb(null, 'uploads/profilePics/');
    } else if (file.fieldname === 'logoUrl') {
      cb(null, 'uploads/logos/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const userId = req.user ? req.user.id : 'unknown';

    if (file.fieldname === 'profilePic') {
      cb(null, 'profile_' + userId + '_' + timestamp + ext);
    } else if (file.fieldname === 'logoUrl') {
      cb(null, 'logo_' + userId + '_' + timestamp + ext);
    } else {
      cb(null, file.fieldname + '_' + userId + '_' + timestamp + ext);
    }
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
}).fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'logoUrl', maxCount: 1 }
]);

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

const createProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Create Profile - Request Body:', req.body);
    console.log('Create Profile - Files:', req.files);

    if (!req.body) {
      return res.status(400).json({ message: 'Request body is missing' });
    }

    // Check if user role is COMPANY
    const user = await User.findOne({ where: { id: userId, userRole: 'COMPANY' } });
    if (!user) {
      return res.status(403).json({ message: 'Unauthorized: Only company users can create recruiter profile' });
    }

    // Check if profile already exists
    const existingProfile = await CompanyRecruiterProfile.findOne({ where: { userId } });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists. Use update endpoint to modify.' });
    }

    // Fetch name, email, phone from User model
    const recruiterName = user.firstName + ' ' + user.lastName;
    const recruiterEmail = user.email;
    const recruiterPhone = user.phone;

    const {
      designation,
      companyName,
      industry,
      location,
      about,
      logoUrl: logoUrlFromBody,
      profilePic: profilePicFromBody,
      hiringPreferences,
      languagesKnown,
      isEmailVerified,
      isPhoneVerified,
      isGstVerified,
    } = req.body;

    // Handle file uploads and fallback to body values
    let profilePic = profilePicFromBody || null;
    let logoUrl = logoUrlFromBody || null;

    if (req.files) {
      if (req.files.profilePic && req.files.profilePic[0]) {
        profilePic = req.files.profilePic[0].path;
      }
      if (req.files.logoUrl && req.files.logoUrl[0]) {
        logoUrl = req.files.logoUrl[0].path;
      }
    }

    console.log('Final profilePic:', profilePic);
    console.log('Final logoUrl:', logoUrl);

    const profile = await CompanyRecruiterProfile.create({
      userId,
      recruiterName,
      recruiterEmail,
      recruiterPhone,
      designation,
      companyName,
      industry,
      location,
      about,
      logoUrl,
      hiringPreferences,
      languagesKnown,
      isEmailVerified,
      isPhoneVerified,
      isGstVerified,
      profilePic,
    });

    return res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating recruiter profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await CompanyRecruiterProfile.findOne({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching recruiter profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await CompanyRecruiterProfile.findOne({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update fields from request body
    const {
      designation,
      companyName,
      industry,
      location,
      about,
      logoUrl: logoUrlFromBody,
      profilePic: profilePicFromBody,
      hiringPreferences,
      languagesKnown,
      isEmailVerified,
      isPhoneVerified,
      isGstVerified,
    } = req.body;

    // Handle file uploads and fallback to body values
    let profilePic = profile.profilePic; // Keep existing if no new file
    let logoUrl = profile.logoUrl; // Keep existing if no new file

    // If new values provided in body, use them (unless files are uploaded)
    if (profilePicFromBody && !req.files?.profilePic) {
      profilePic = profilePicFromBody;
    }
    if (logoUrlFromBody && !req.files?.logoUrl) {
      logoUrl = logoUrlFromBody;
    }

    if (req.files) {
      if (req.files.profilePic && req.files.profilePic[0]) {
        profilePic = req.files.profilePic[0].path;
      }
      if (req.files.logoUrl && req.files.logoUrl[0]) {
        logoUrl = req.files.logoUrl[0].path;
      }
    }

    // Update profile fields except recruiterName, recruiterEmail, recruiterPhone
    await profile.update({
      designation,
      companyName,
      industry,
      location,
      about,
      logoUrl,
      hiringPreferences,
      languagesKnown,
      isEmailVerified,
      isPhoneVerified,
      isGstVerified,
      profilePic,
    });

    const user = await User.findOne({ where: { id: userId, userRole: 'COMPANY' } });
    if (user) {
      await profile.update({
        recruiterName: user.firstName + ' ' + user.lastName,
        recruiterEmail: user.email,
        recruiterPhone: user.phone,
      });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error updating recruiter profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//  New method to get detailed list of job posts by recruiter
const getJobPostsByRecruiter = async (req, res) => {
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

    // Query job posts for this recruiter
    const jobPosts = await JobPost.findAll({
      where: { companyRecruiterProfileId: companyRecruiterProfile.id },
      attributes: [
        'jobId',
        ['jobProfile', 'jobRoleTitle'],
        'internshipToDate',
        // Total Views not available, return 0
        [literal('0'), 'totalViews'],
      ],
      include: [
        {
          model: Application,
          attributes: []
        }
      ],
      group: ['JobPost.jobId'],
      raw: true,
      nest: true,
      // Add total number of applications and last application date using subqueries
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM applications AS Application
              WHERE Application.jobPostId = JobPost.jobId
            )`),
            'totalApplications'
          ],
          [
            Sequelize.literal(`(
              SELECT MAX(createdAt)
              FROM applications AS Application
              WHERE Application.jobPostId = JobPost.jobId
            )`),
            'lastApplicationDate'
          ]
        ]
      }
    });

    // Derive status based on internshipToDate (if past date, Closed, else Active)
    const currentDate = new Date();
    const formattedJobPosts = jobPosts.map(post => {
      let status = 'Active';
      if (post.internshipToDate && new Date(post.internshipToDate) < currentDate) {
        status = 'Closed';
      }
      return {
        jobId: post.jobId,
        jobRoleTitle: post.jobProfile,
        status,
        totalViews: post.views,
        totalApplications: parseInt(post.totalApplications, 10) || 0,
        lastApplicationDate: post.lastApplicationDate || null
      };
    });

    return res.status(200).json({ jobPosts: formattedJobPosts });

  } catch (error) {
    console.error("Error fetching job posts by recruiter:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const incrementViewCount = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required." });
    }

    const jobPost = await JobPost.findOne({ where: { jobId } });

    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found." });
    }

    // Increment the views count
    jobPost.views = (jobPost.views || 0) + 1;
    await jobPost.save();

    return res.status(200).json({ message: "View count incremented.", views: jobPost.views });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


async function updateExperienceStatus(req, res) {
  try {
    const userId = req.user.id;
    const { experienceId } = req.params;
    const { status } = req.body;

    if (!['approved', 'unapproved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    // Find company recruiter profile for the logged-in user
    const companyRecruiterProfile = await require('../models').CompanyRecruiterProfile.findOne({ where: { userId } });
    if (!companyRecruiterProfile) {
      return res.status(403).json({ message: 'Unauthorized: Company recruiter profile not found.' });
    }

    // Find experience by id and companyRecruiterProfileId
    const experience = await Experience.findOne({
      where: {
        id: experienceId,
        companyRecruiterProfileId: companyRecruiterProfile.id,
      }
    });

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found for this company recruiter.' });
    }

    experience.status = status;
    await experience.save();

    return res.status(200).json({ message: 'Experience status updated successfully.', experience });
  } catch (error) {
    console.error('Error updating experience status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  createProfile,
  getProfile,
  updateProfile,
  getJobPostsByRecruiter,
  incrementViewCount,
  updateExperienceStatus,
  upload,
  handleUploadError,
};
