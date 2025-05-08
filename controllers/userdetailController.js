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
    } = req.body;

    console.log('Received user detail data:', req.body);

    // Validate required fields
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

    // Conditional nullification based on userType
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
      // Fresher or other user types: nullify both education and work fields
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

    const userDetail = await UserDetail.findOne({ where: { userId } });
    if (!userDetail) {
      return res.status(404).json({ message: "User details not found." });
    }

    await userDetail.update(updateData);

    return res.status(200).json({ message: "User details updated successfully.", userDetail });
  } catch (error) {
    console.error("Error updating user details:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

module.exports = { createUserDetails, getUserDetailsByUserId, updateUserDetailsByUserId };
