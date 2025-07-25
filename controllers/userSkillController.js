
const { UserSkill } = require('../models');

// Refactored: Now expects application/json with certificate_image as a URL
const uploadSkillController = async (req, res) => {
  try {
    const { user_id, skills } = req.body;
    // skills should be an array of skill objects, each with a certificate_image URL

    if (!Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills must be an array.' });
    }

    for (let i = 0; i < skills.length; i++) {
      const skillItem = skills[i];
      // Validate required fields
      if (!skillItem.skill_id || !skillItem.skill || !skillItem.authority || !skillItem.certificate_image) {
        return res.status(400).json({ error: `Missing required fields in skill at index ${i}` });
      }

      const userSkillData = {
        userId: parseInt(user_id),
        skill_id: parseInt(skillItem.skill_id),
        skill: skillItem.skill,
        authority: skillItem.authority,
        certificate_image: skillItem.certificate_image // Now a URL
      };

      await UserSkill.create(userSkillData);
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
