
const fs = require('fs');
const { UserSkill } = require('../models');

const uploadSkillController = async (req, res) => {
  try {
    console.log(req.body)
    console.log(req.files)
    const { user_id } = req.body;
    const skills = JSON.parse(req.body.skills); 


    for (let i = 0; i < skills.length; i++) {
  const skillItem = skills[i];
  const fileKey = `certificate_image_${i}`;

  const imageFile = req.files.find(file => file.fieldname === fileKey);

  if (!imageFile) {
    console.warn(`No certificate image found for skill at index ${i}`);
    continue;
  }

  const imageData = fs.readFileSync(imageFile.path);

  await UserSkill.create({
    userId: parseInt(user_id),
    skill_id: parseInt(skillItem.skill_id),
    skill: skillItem.skill,
    authority: skillItem.authority,
    certificate_image: imageData
  });

  fs.unlinkSync(imageFile.path); 
}


    res.status(200).json({ message: 'Skills uploaded successfully!' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error uploading skills' });
  }
};

module.exports = uploadSkillController;
