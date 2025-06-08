const { UniversityDetail, User, FeedPost } = require('../models');
const universitydetail = require('../models/universitydetail');

const createUniversityDetail = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user id is available in req.user
    const user = await User.findByPk(userId);
    if (!user|| user.userRole !== 'UNIVERSITY') {
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
      profilepic: req.body.profilepic,
      socialMediaLink: req.body.socialMediaLink,
      emailIdVerified: req.body.emailIdVerified || false,
      adharVerified: req.body.adharVerified || false,
      phoneVerified: req.body.phoneVerified || false,
    };

    const universityDetail = await UniversityDetail.create(data);

    // Dummy data for courses and college names
    const coursesList = ['BTech', 'MTech', 'BCA', 'MCA', 'MBA', 'BBA', 'EC'];
    const collegeNamesList = ['ABC University', 'XYZ College', 'PQR Institute', 'LMN University', 'DEF College'];

    return res.status(201).json({
      universityDetail,
      courses: coursesList,
      collegeNames: collegeNamesList
    });
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
      profilepic: req.body.profilepic,
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

const universityprofile = async (req,res) =>{
  try{
    const {userId} = req.params;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId parameter" });
    }
    const universitydetailRaw = await UniversityDetail.findOne({
      where: {userId},
      attributes: [
        'profilepic','emailId','collegeName', 'address', 'websiteLink', 'about','socialMediaLink'
      ],
      raw:true
    });

    if(!universitydetailRaw){
      return res.status(404).json({message: "profile not found"});

    }
    const userDetail = {};
    for (const key in universitydetailRaw) {
      if (universitydetailRaw[key] !== null && universitydetailRaw[key] !== '') {
        userDetail[key] = universitydetailRaw[key];
      }
    }
     const feedPosts = await FeedPost.findAll({
      where: { userId },
      attributes: ['caption', 'image', 'likeCount', 'commentCount', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
 return res.status(200).json({
      publicProfile: userDetail,
      activity: feedPosts
    });
  }
  catch (error) {
    console.error("Error fetching university profile:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createUniversityDetail,
  updateUniversityDetail,
  getUniversityDetailById,
  universityprofile
};
