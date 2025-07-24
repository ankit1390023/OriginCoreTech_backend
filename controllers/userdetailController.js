const { User, UserDetail, UserSkill, FeedPost, Experience } = require('../models');

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
      jobLocation,
      experiences, // new field for multiple experiences
      salaryDetails,
      currentlyLookingFor,
      workMode,
    } = req.body;

    // console.log('Received user detail data:', req.body);

    if (!email || !firstName || !lastName || !phone || !dob || !userType || !gender) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    // // Get user ID from authenticated user (from authMiddleware)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID not found." });
    }

    // Get user email from the authenticated user
    const registeredUser = await User.findByPk(userId);
    if (!registeredUser) {
      return res.status(400).json({ message: "User not found." });
    }


    const existingDetail = await UserDetail.findOne({ where: { userId } });
    // if (existingDetail) {
    //   return res.status(409).json({ message: "User details already exist." });
    // }

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
    if (userType === 'School Student' || userType === 'College Student') {
      eduFields = {
        educationStandard,
        course,
        collegeName,
        specialization,
        startYear,
        endYear,
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
    }

    const userDetail = existingDetail
      ? await existingDetail.update({
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
        jobLocation,
        salaryDetails,
        currentlyLookingFor,
        workMode,

      })
      : await UserDetail.create({
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
        jobLocation,
        salaryDetails,
        currentlyLookingFor,
        workMode,
      });
    // If experiences array is provided, create associated Experience records
    if (Array.isArray(experiences) && experiences.length > 0) {
      for (const exp of experiences) {
        let companyRecruiterProfileId = exp.companyRecruiterProfileId || null;
        if (!companyRecruiterProfileId && exp.currentCompany) {
          // Fetch companyRecruiterProfileId by companyName
          const companyProfile = await require('../models').CompanyRecruiterProfile.findOne({
            where: { companyName: exp.currentCompany }
          });
          if (companyProfile) {
            companyRecruiterProfileId = companyProfile.id;
          }
        }
        const totalExperience = exp.endDate ? (new Date(exp.endDate) - new Date(exp.startDate)) / (1000 * 60 * 60 * 24 * 365) : 0; // Calculate experience in years
        // Delete existing experiences for the user
        await Experience.destroy({
          where: { userDetailId: userDetail.id }
        });

        // Create new experience records
        await Experience.create({
          userDetailId: userDetail.id,
          companyRecruiterProfileId,
          totalExperience,
          currentJobRole: exp.jobRole || null,
          currentCompany: exp.company || null,
          status: exp.status || 'pending',
        });
      }
    }

    return res.status(201).json({
      message: "User details and experiences added successfully.",
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
    const userDetail = await UserDetail.findOne({
      where: { userId },
      include: [
        {
          model: require('../models').Experience,
          as: 'experiences'
        }
      ]
    });
    if (!userDetail) {
      return res.status(404).json({ message: "User details not found." });
    }

    // Fetch user skills
    const userSkills = await UserSkill.findAll({
      where: { userId },
      attributes: ['skill']
    });
    // Return skills as array of strings
    const skillsArray = userSkills.map(s => s.skill);
    return res.status(200).json({
      userDetail,
      skills: skillsArray,

    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function updateUserDetailsByUserId(req, res) {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const experiences = updateData.experiences || [];
    delete updateData.experiences;
    const skills = updateData.skills || [];
    delete updateData.skills;

    const allowedFields = [
      'firstName',
      'lastName',
      'phone',
      'dob',
      'city',
      'gender',
      'languages',
      'userType',
      'educationStandard',
      'course',
      'collegeName',
      'specialization',
      'startYear',
      'endYear',
      'aboutus',
      'careerObjective',
      'resume',
      'language',
      'isEmailVerified',
      'isPhoneVerified',
      'isGstVerified',
      'userprofilepic',
      'aadhaarNumber',
      'aadhaarCardFile',
      'isAadhaarVerified',
      'currentLocation',
      'jobLocation',
      'salaryDetails',
      'currentlyLookingFor',
      'workMode',
      'Standard'
    ];

    const filteredUpdateData = {};
    allowedFields.forEach(field => {
      if (field in updateData) {
        filteredUpdateData[field] = updateData[field];
      }
    });

    const userDetail = await UserDetail.findOne({ where: { userId } });
    if (!userDetail) {
      return res.status(404).json({ message: "User details not found." });
    }

    // Update userdetail fields
    await userDetail.update(filteredUpdateData);

    // Update experiences if provided
    if (Array.isArray(experiences) && experiences.length > 0) {
      const Experience = require('../models').Experience;
      for (const exp of experiences) {
        let existingExp = null;
        if (exp.id) {
          existingExp = await Experience.findByPk(exp.id);
        }
        if (!existingExp && exp.currentCompany && exp.currentJobRole) {
          existingExp = await Experience.findOne({
            where: {
              userDetailId: userDetail.id,
              currentCompany: exp.currentCompany,
              currentJobRole: exp.currentJobRole
            }
          });
        }
        if (existingExp) {
          // If status is approved, change to pending on update
          if (existingExp.status === 'approved') {
            exp.status = 'pending';
          }
          await existingExp.update({
            currentCompany: exp.currentCompany,
            currentJobRole: exp.currentJobRole,
            totalExperience: exp.totalExperience,
            status: exp.status
          });
        } else {
          // Create new experience if not found, use status from payload or default to 'pending'
          await Experience.create({
            userDetailId: userDetail.id,
            currentCompany: exp.currentCompany,
            currentJobRole: exp.currentJobRole,
            totalExperience: exp.totalExperience,
            status: exp.status || 'pending'
          });
        }
      }
    }

    // Update skills if provided
    if (Array.isArray(skills)) {
      // Remove all existing skills for the user
      await UserSkill.destroy({ where: { userId } });
      // Add new skills if any
      if (skills.length > 0) {
        const skillRecords = skills.map(skill => ({
          userId,
          skill,
          authority: '', // or set as needed
          skill_id: 0    // or set as needed
        }));
        await UserSkill.bulkCreate(skillRecords);
      }
    }

    // Fetch updated skills
    const userSkills = await UserSkill.findAll({
      where: { userId },
      attributes: ['skill']
    });

    // Fetch updated experiences
    const updatedExperiences = await Experience.findAll({
      where: { userDetailId: userDetail.id },
      attributes: [
        'id',
        'currentCompany',
        'currentJobRole',
        'totalExperience',
        'status'
      ],
      order: [['createdAt', 'DESC']]
    });

    // Return skills as array of strings
    const skillsArray = userSkills.map(s => s.skill);

    return res.status(200).json({
      message: "User details updated successfully.", userDetail,
      skills: skillsArray,
      experiences: updatedExperiences
    });


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

const getPublicProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Basic user detail
    const userDetailRaw = await UserDetail.findOne({
      where: { userId },
      attributes: [
        'firstName', 'lastName', 'language', 'userType', 'aboutus',
        'careerObjective', 'userprofilepic', 'email',
        'course', 'specialization', 'Standard', 'college', 'startYear', 'endYear'
      ],
      raw: true
    });

    if (!userDetailRaw) {
      return res.status(404).json({ message: "Public profile not found." });
    }

    // Remove null or empty fields from userDetail
    const userDetail = {};
    for (const key in userDetailRaw) {
      if (userDetailRaw[key] !== null && userDetailRaw[key] !== '') {
        userDetail[key] = userDetailRaw[key];
      }
    }

    // 2. User skills
    const userSkills = await UserSkill.findAll({
      where: { userId },
      attributes: ['skill']
    });

    const skillArray = userSkills.map(s => s.skill);

    // 3. User activity (feed posts)
    const feedPosts = await FeedPost.findAll({
      where: { userId },
      attributes: ['caption', 'image', 'likeCount', 'commentCount', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // 4. User experiences
    const userDetailRecord = await UserDetail.findOne({ where: { userId } });
    let experiences = [];
    if (userDetailRecord) {
      experiences = await Experience.findAll({
        where: { userDetailId: userDetailRecord.id },
        attributes: ['companyRecruiterProfileId', 'totalExperience', 'currentJobRole', 'currentCompany', 'status'],
        order: [['createdAt', 'DESC']]
      });
    }

    return res.status(200).json({
      publicProfile: userDetail,
      skills: skillArray,
      activity: feedPosts,
      experiences: experiences
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



module.exports = {
  createUserDetails,
  getUserDetailsByUserId,
  updateUserDetailsByUserId,
  updateTermsAndCondition,
  getTermsAndCondition,
  getAadhaarVerificationStatus,
  updateAadhaarDetails,
  getPublicProfileByUserId
};

