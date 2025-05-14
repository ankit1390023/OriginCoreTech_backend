const { User, UserDetail } = require('../models');
const { Op } = require('sequelize');

async function createUserDetails(req, res) {
  try {
    const {
      email,
      firstName,
      lastName,
      phone,
      dob,
      city,
      gender,
      languages,
      userType,
      educationStandard,
      course,
      collegeName,
      specialization,
      startYear,
      endYear,
      totalExperience,
      currentJobRole,
      currentCompany,
      salaryDetails,
      currentlyLookingFor,
      workMode,
      currentLocation,
      jobLocation,
      aboutus,
      careerObjective,
      resume,
      language,
      isEmailVerified,
      isPhoneVerified,
      isGstVerified,
      userprofilepic,
      aadhaarNumber,
      aadhaarCardFile,
      isAadhaarVerified,
    } = req.body;

    console.log('Received user detail data:', req.body);

    if (!email || !firstName || !lastName || !phone || !dob || !userType) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    const registeredUser = await User.findOne({ where: { email } });
    if (!registeredUser) {
      return res.status(400).json({ message: "Email is not registered." });
    }
    const userId = registeredUser.id;

    const existingDetail = await UserDetail.findOne({ where: { userId } });
    if (existingDetail) {
      return res.status(409).json({ message: "User details already exist." });
    }

    const emailExists = await UserDetail.findOne({
      where: {
        email,
        userId: { [Op.ne]: userId }
      }
    });

    if (emailExists) {
      return res.status(409).json({ message: "Email is already in use by another user." });
    }

    let eduFields = {};
    let workFields = {};

    if (userType === 'School Student' || userType === 'College Student') {
      eduFields = {
        educationStandard,
        course,
        collegeName,
        specialization,
        startYear,
        endYear,
      };
      workFields = {
        totalExperience: null,
        currentJobRole: null,
        currentCompany: null,
        salaryDetails: null,
        currentlyLookingFor: null,
        workMode: null,
        currentLocation: null,
        jobLocation: null,
      };
    } else if (userType === 'Working Professional') {
      eduFields = {
        educationStandard: null,
        course: null,
        collegeName: null,
        specialization: null,
        startYear: null,
        endYear: null,
      };
      workFields = {
        totalExperience,
        currentJobRole,
        currentCompany,
        salaryDetails,
        currentlyLookingFor,
        workMode,
        currentLocation,
        jobLocation,
      };
    } else {
      eduFields = {
        educationStandard: null,
        course: null,
        collegeName: null,
        specialization: null,
        startYear: null,
        endYear: null,
      };
      workFields = {
        totalExperience: null,
        currentJobRole: null,
        currentCompany: null,
        salaryDetails: null,
        currentlyLookingFor: null,
        workMode: null,
        currentLocation: null,
        jobLocation: null,
      };
    }

    const userDetail = await UserDetail.create({
      userId,
      firstName,
      lastName,
      email,
      phone,
      dob,
      city,
      gender,
      languages,
      userType,
      ...eduFields,
      ...workFields,
      aboutus,
      careerObjective,
      resume,
      language,
      isEmailVerified,
      isPhoneVerified,
      isGstVerified,
      userprofilepic,
      aadhaarNumber,
      aadhaarCardFile,
      isAadhaarVerified,
    });

    return res.status(201).json({
      message: "User details added successfully.",
      userDetail,
    });

  } catch (error) {
    console.error("Error creating user details:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function getUserDetailsByUserId(req, res) {
  try {
    const { userId } = req.params;
    const userDetail = await UserDetail.findOne({ where: { userId } });
    if (!userDetail) {
      return res.status(404).json({ message: "User details not found." });
    }
    return res.status(200).json({ userDetail });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function updateUserDetailsByUserId(req, res) {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const allowedFields = [
      'aboutus',
      'careerObjective',
      'resume',
      'language',
      'isEmailVerified',
      'isPhoneVerified',
      'isGstVerified',
      'userprofilepic'

    ];

    const filteredUpdateData = { ...updateData };
    allowedFields.forEach(field => {
      if (!(field in updateData)) {
        delete filteredUpdateData[field];
      }
    });

    const userDetail = await UserDetail.findOne({ where: { userId } });
    if (!userDetail) {
      return res.status(404).json({ message: "User details not found." });
    }

    // Update all fields including the new ones
    await userDetail.update(updateData);

    return res.status(200).json({ message: "User details updated successfully.", userDetail });
  } catch (error) {
    console.error("Error updating user details:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}


async function updateTermsAndCondition(req, res) {
  try {
    const { userId, accepted } = req.body;
    if (typeof accepted !== 'boolean' || !userId) {
      return res.status(400).json({ message: 'User ID and accepted boolean are required.' });
    }

    const userDetail = await UserDetail.findOne({ where: { userId } });
    if (!userDetail) {
      return res.status(404).json({ message: 'User details not found.' });
    }

    userDetail.termsAndCondition = accepted;
    await userDetail.save();

    return res.status(200).json({ message: 'Terms and conditions updated successfully.', termsAndCondition: accepted });
  } catch (error) {
    console.error('Error updating terms and conditions:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}

async function getTermsAndCondition(req, res) {
  try {
    // For demonstration, returning static terms and conditions text
    const termsText = "These are the terms and conditions of the application...";
    return res.status(200).json({ termsAndCondition: termsText });
  } catch (error) {
    console.error('Error fetching terms and conditions:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}

async function getAadhaarVerificationStatus(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID not found." });
    }
    const userDetail = await UserDetail.findOne({ where: { userId } });
    if (!userDetail) {
      return res.status(404).json({ message: "User details not found." });
    }
    return res.status(200).json({ isAadhaarVerified: userDetail.isAadhaarVerified });
  } catch (error) {
    console.error("Error fetching Aadhaar verification status:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function updateAadhaarDetails(req, res) {
  try {
    const userId = req.user?.id;
    let { aadhaarNumber, aadhaarCardFile, isAadhaarVerified } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID not found." });
    }

    const userDetail = await UserDetail.findOne({ where: { userId } });
    if (!userDetail) {
      return res.status(404).json({ message: "User details not found." });
    }

    // Automatically set isAadhaarVerified to true if aadhaarNumber and aadhaarCardFile are provided
    if (aadhaarNumber && aadhaarCardFile) {
      isAadhaarVerified = true;
    }

    await userDetail.update({
      aadhaarNumber,
      aadhaarCardFile,
      isAadhaarVerified,
    });

    return res.status(200).json({ message: "Aadhaar details updated successfully.", userDetail });
  } catch (error) {
    console.error("Error updating Aadhaar details:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

module.exports = { 
  createUserDetails, 
  getUserDetailsByUserId, 
  updateUserDetailsByUserId,
  updateTermsAndCondition,
  getTermsAndCondition,
  getAadhaarVerificationStatus,
  updateAadhaarDetails
};

