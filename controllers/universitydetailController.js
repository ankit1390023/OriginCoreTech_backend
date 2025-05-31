const { UniversityDetail, User } = require('../models');

const createUniversityDetail = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user id is available in req.user
    const user = await User.findByPk(userId);
    if (!user || user.userRole !== 'UNIVERSITY') {
      return res.status(403).json({ message: 'User is not authorized as UNIVERSITY' });
    }

    const existingUniversityDetail = await UniversityDetail.findOne({ where: { userId } });
    if (existingUniversityDetail) {
      return res.status(400).json({ message: 'University detail already exists' });
    }

    const data = {
      userId,
      emailId: user.email,
      phone: user.phone,
      collegeName: req.body.collegeName,
      course: req.body.course,
      address: req.body.address,
      pincode: req.body.pincode,
      websiteLink: req.body.websiteLink,
      about: req.body.about,
      socialMediaLink: req.body.socialMediaLink,
      emailIdVerified: req.body.emailIdVerified || false,
      adharVerified: req.body.adharVerified || false,
      phoneVerified: req.body.phoneVerified || false,
    };

    const universityDetail = await UniversityDetail.create(data);

    return res.status(201).json(universityDetail);
  } catch (error) {
    console.error('Error in createUniversityDetail:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUniversityDetail = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user id is available in req.user
    const user = await User.findByPk(userId);
    if (!user || user.userRole !== 'UNIVERSITY') {
      return res.status(403).json({ message: 'User is not authorized as UNIVERSITY' });
    }

    const universityDetail = await UniversityDetail.findOne({ where: { userId } });
    if (!universityDetail) {
      return res.status(404).json({ message: 'University detail not found' });
    }

    const data = {
      collegeName: req.body.collegeName,
      course: req.body.course,
      address: req.body.address,
      pincode: req.body.pincode,
      websiteLink: req.body.websiteLink,
      about: req.body.about,
      socialMediaLink: req.body.socialMediaLink,
      emailIdVerified: req.body.emailIdVerified || universityDetail.emailIdVerified,
      adharVerified: req.body.adharVerified || universityDetail.adharVerified,
      phoneVerified: req.body.phoneVerified || universityDetail.phoneVerified,
    };

    await universityDetail.update(data);

    return res.status(200).json(universityDetail);
  } catch (error) {
    console.error('Error in updateUniversityDetail:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getUniversityDetailById = async (req, res) => {
  try {
    const universityId = req.params.id;
    const universityDetail = await UniversityDetail.findOne({ where: { id: universityId } });
    if (!universityDetail) {
      return res.status(404).json({ message: 'University detail not found' });
    }
    return res.status(200).json(universityDetail);
  } catch (error) {
    console.error('Error in getUniversityDetailById:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createUniversityDetail,
  updateUniversityDetail,
  getUniversityDetailById,
};
