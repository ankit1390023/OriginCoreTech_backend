const fs = require('fs');

const { UserSkill } = require('../models');


const uploadSkillController = async (req, res) => {
  try {
    
    
    const { user_id, skill_id,skill, authority } = req.body;
    const imageData = fs.readFileSync(req.file.path); 
    console.log(typeof(user_id))
    
let userId = parseInt(user_id);
let skillId = parseInt(skill_id);


    await UserSkill.create({
      userId: user_id, 
      skill_id: skill_id, 
      skill:skill,
      authority: authority,
      certificate_image: imageData
    });
    

    fs.unlinkSync(req.file.path);

    res.status(200).json({ message: 'Skill uploaded successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error uploading skill' });
  }
};

module.exports = uploadSkillController;
