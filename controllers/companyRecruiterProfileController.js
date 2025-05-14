const multer = require('multer');
const path = require('path');
const { User, CompanyRecruiterProfile } = require('../models');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profilePics/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'profile_' + req.user.id + '_' + Date.now() + ext);
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
}).single('profilePic');

const createProfile = async (req, res) => {
  try {
    const userId = req.user.id;

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
      logoUrl,
      hiringPreferences,
      languagesKnown,
      isEmailVerified,
      isPhoneVerified,
      isGstVerified,
      profilePic,
    } = req.body;

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
      logoUrl,
      hiringPreferences,
      languagesKnown,
      isEmailVerified,
      isPhoneVerified,
      isGstVerified,
      profilePic,
    } = req.body;

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



module.exports = {
  createProfile,
  getProfile,
  updateProfile,

};
