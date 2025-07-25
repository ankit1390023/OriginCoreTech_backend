const multer = require('multer');
const path = require('path');
const { User, CompanyRecruiterProfile, JobPost, } = require('../models');
const Application = require('../models/application');
const { Op, fn, col, literal, Sequelize } = require('sequelize');
const { Experience } = require('../models');
const { parseBoolean, parseJsonField, extractProfileFiles } = require('../utils/fieldParsers');
const { upload, handleUploadError } = require('../utils/upload');

const createProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("userId", userId);
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




    const missingFields = [];

    // More robust validation that handles various edge cases
    if (!designation || (typeof designation === 'string' && designation.trim() === '')) {
      missingFields.push('designation');
    }
    if (!companyName || (typeof companyName === 'string' && companyName.trim() === '')) {
      missingFields.push('companyName');
    }
    if (!industry || (typeof industry === 'string' && industry.trim() === '')) {
      missingFields.push('industry');
    }
    if (!location || (typeof location === 'string' && location.trim() === '')) {
      missingFields.push('location');
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')} are required`,
        receivedData: {
          designation: designation || null,
          companyName: companyName || null,
          industry: industry || null,
          location: location || null
        },
        debug: {
          designationExists: !!designation,
          companyNameExists: !!companyName,
          industryExists: !!industry,
          locationExists: !!location,
          bodyKeys: Object.keys(req.body || {})
        }
      });
    }

    // Parse and validate fields using utils
    let parsedHiringPreferences, parsedLanguagesKnown;
    try {
      parsedHiringPreferences = parseJsonField(hiringPreferences);
      parsedLanguagesKnown = parseJsonField(languagesKnown, true);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // Convert booleans
    const emailVerified = parseBoolean(isEmailVerified);
    const phoneVerified = parseBoolean(isPhoneVerified);
    const gstVerified = parseBoolean(isGstVerified);

    // Extract files
    const { profilePic: extractedProfilePic, logoUrl: extractedLogoUrl } = extractProfileFiles(req.files);
    let profilePic = extractedProfilePic || profilePicFromBody || null;
    let logoUrl = extractedLogoUrl || logoUrlFromBody || null;



    // Before saving, convert to JSON string if not null
    const hiringPreferencesString = parsedHiringPreferences ? JSON.stringify(parsedHiringPreferences) : null;
    const languagesKnownString = parsedLanguagesKnown ? JSON.stringify(parsedLanguagesKnown) : null;

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
      hiringPreferences: hiringPreferencesString,
      languagesKnown: languagesKnownString,
      isEmailVerified: emailVerified,
      isPhoneVerified: phoneVerified,
      isGstVerified: gstVerified,
      profilePic,
    });

    return res.status(201).json({
      message: 'Company recruiter profile created successfully',
      profile: {
        ...profile.toJSON(),
        profilePicUrl: profile.profilePic,
        // Remove the original profilePic key from the response
        ...(profile.profilePic !== undefined ? { profilePic: undefined } : {})
      }
    });
  } catch (error) {
    console.error('Error creating recruiter profile:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await CompanyRecruiterProfile.findOne({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json({
      ...profile.toJSON(),
      profilePicUrl: profile.profilePic,
      ...(profile.profilePic !== undefined ? { profilePic: undefined } : {})
    });
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

    // Parse hiringPreferences if it's a JSON string
    let parsedHiringPreferences = profile.hiringPreferences; // Keep existing if no new value
    if (hiringPreferences !== undefined) {
      try {
        parsedHiringPreferences = typeof hiringPreferences === 'string'
          ? JSON.parse(hiringPreferences)
          : hiringPreferences;
      } catch (error) {
        console.error('Error parsing hiringPreferences:', error);
        return res.status(400).json({ message: 'Invalid hiringPreferences format. Must be valid JSON.' });
      }
    }

    // Parse languagesKnown if it's a JSON string
    let parsedLanguagesKnown = profile.languagesKnown; // Keep existing if no new value
    if (languagesKnown !== undefined) {
      try {
        parsedLanguagesKnown = typeof languagesKnown === 'string'
          ? JSON.parse(languagesKnown)
          : languagesKnown;

        // Ensure it's an array
        if (!Array.isArray(parsedLanguagesKnown)) {
          return res.status(400).json({ message: 'languagesKnown must be an array.' });
        }
      } catch (error) {
        console.error('Error parsing languagesKnown:', error);
        return res.status(400).json({ message: 'Invalid languagesKnown format. Must be valid JSON array.' });
      }
    }

    // Convert boolean strings to actual booleans
    const emailVerified = isEmailVerified !== undefined ? parseBoolean(isEmailVerified) : profile.isEmailVerified;
    const phoneVerified = isPhoneVerified !== undefined ? parseBoolean(isPhoneVerified) : profile.isPhoneVerified;
    const gstVerified = isGstVerified !== undefined ? parseBoolean(isGstVerified) : profile.isGstVerified;

    // Extract files
    const { profilePic: extractedProfilePic, logoUrl: extractedLogoUrl } = extractProfileFiles(req.files);
    let profilePic = profile.profilePic; // Keep existing if no new file
    let logoUrl = profile.logoUrl; // Keep existing if no new file

    // If new values provided in body, use them (unless files are uploaded)
    if (profilePicFromBody && (!req.files || !Array.isArray(req.files) || !req.files.some(f => f.fieldname === 'profilePic'))) {
      profilePic = profilePicFromBody;
    }
    if (logoUrlFromBody && (!req.files || !Array.isArray(req.files) || !req.files.some(f => f.fieldname === 'logoUrl'))) {
      logoUrl = logoUrlFromBody;
    }

    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        if (file.fieldname === 'profilePic') {
          profilePic = file.path;
        } else if (file.fieldname === 'logoUrl') {
          logoUrl = file.path;
        }
      });
    }

    // In updateProfile, do the same before update
    const hiringPreferencesStringUpdate = parsedHiringPreferences ? JSON.stringify(parsedHiringPreferences) : null;
    const languagesKnownStringUpdate = parsedLanguagesKnown ? JSON.stringify(parsedLanguagesKnown) : null;

    // Update profile fields except recruiterName, recruiterEmail, recruiterPhone
    await profile.update({
      designation: designation || profile.designation,
      companyName: companyName || profile.companyName,
      industry: industry || profile.industry,
      location: location || profile.location,
      about: about !== undefined ? about : profile.about,
      logoUrl,
      hiringPreferences: hiringPreferencesStringUpdate,
      languagesKnown: languagesKnownStringUpdate,
      isEmailVerified: emailVerified,
      isPhoneVerified: phoneVerified,
      isGstVerified: gstVerified,
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

    return res.status(200).json({
      message: 'Company recruiter profile updated successfully',
      profile: {
        ...profile.toJSON(),
        profilePicUrl: profile.profilePic,
        ...(profile.profilePic !== undefined ? { profilePic: undefined } : {})
      }
    });
  } catch (error) {
    console.error('Error updating recruiter profile:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
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
