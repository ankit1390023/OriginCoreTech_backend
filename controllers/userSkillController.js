
const fs = require('fs');
const path = require('path');
const { UserSkill } = require('../models');

const uploadSkillController = async (req, res) => {
  try {
    const { user_id } = req.body;
    const skills = JSON.parse(req.body.skills);

    // File size validation (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    for (let i = 0; i < skills.length; i++) {
      const skillItem = skills[i];
      const fileKey = `certificate_image_${i}`;


      const imageFile = req.files.find(file => file.fieldname === fileKey);

      if (!imageFile) {
        console.warn(`No certificate image found for skill at index ${i}`);
        continue;
      }


      // Check file size
      if (imageFile.size > MAX_FILE_SIZE) {
        return res.status(400).json({
          error: `File ${imageFile.originalname} is too large. Maximum size allowed is 5MB.`
        });
      }

      // Create certificates directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../uploads/certificates');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      } 

      // Generate unique filename while preserving original name
      const fileExtension = path.extname(imageFile.originalname);
      const originalNameWithoutExt = path.basename(imageFile.originalname, fileExtension);
      const timestamp = Date.now();
      const uniqueFilename = `${originalNameWithoutExt}_${timestamp}${fileExtension}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      // Move file to permanent location
      fs.renameSync(imageFile.path, filePath);


      // Store file path instead of file data in database
      const userSkillData = {
        userId: parseInt(user_id),
        skill_id: parseInt(skillItem.skill_id),
        skill: skillItem.skill,
        authority: skillItem.authority,
        certificate_image: `/uploads/certificates/${uniqueFilename}` // Store path instead of data
      };

      const createdSkill = await UserSkill.create(userSkillData);

    }
    res.status(200).json({ message: 'Skills uploaded successfully!' });
  } catch (error) {  
    res.status(500).json({ error: 'Error uploading skills' });
  }
};

// Get user skills
const getUserSkillsController = async (req, res) => {
  try {
    const { userId } = req.params;

    const userSkills = await UserSkill.findAll({
      where: { userId: parseInt(userId) },
      attributes: ['id', 'skill_id', 'skill', 'authority', 'certificate_image', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    // Transform the data to include full URLs for certificate images
    const skillsWithUrls = userSkills.map(skill => {
      const skillData = skill.toJSON();

      // Add full URL for certificate image if it exists
      if (skillData.certificate_image) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        skillData.certificate_url = `${baseUrl}${skillData.certificate_image}`;

        // Extract filename for display - get original name without timestamp
        const filename = skillData.certificate_image.split('/').pop();
        const certFileExtension = path.extname(filename);
        const filenameWithoutExt = path.basename(filename, certFileExtension);

        // Remove timestamp from filename (last part after underscore is always the timestamp)
        const lastUnderscoreIndex = filenameWithoutExt.lastIndexOf('_');
        const originalName = lastUnderscoreIndex !== -1 ? filenameWithoutExt.substring(0, lastUnderscoreIndex) : filenameWithoutExt;
        skillData.certificate_filename = originalName + certFileExtension;

        // Determine file type for proper display
        const fileExtension = path.extname(filename).toLowerCase();
        skillData.certificate_type = fileExtension === '.pdf' ? 'pdf' : 'image';
      }

      return skillData;
    });

    res.status(200).json({
      success: true,
      data: skillsWithUrls,
      count: skillsWithUrls.length
    });
  } catch (error) {
    console.error('Error fetching user skills:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching user skills'
    });
  }
};

module.exports = {
  uploadSkillController,
  getUserSkillsController
};
