const fs = require('fs');

const { UserSkill } = require('../models');

// Controller for handling the upload logic
const uploadSkillController = async (req, res) => {
  try {
    
    
    const { user_id, skill_id, authority } = req.body;
    const imageData = fs.readFileSync(req.file.path); // Read image file
    console.log(typeof(user_id))
    
let userId = parseInt(user_id);
let skillId = parseInt(skill_id);
console.log(typeof(userId)+" user id is : "+ userId)
console.log(typeof(userId)+" user id is : "+ skillId)
const id = 2;
    // Save data into the database using Sequelize
    await UserSkill.create({
      userId,
      id,
      authority,
      certificate_image: imageData
    });

    // Delete the temporary file
    fs.unlinkSync(req.file.path);

    res.status(200).json({ message: 'Skill uploaded successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error uploading skill' });
  }
};

module.exports = uploadSkillController;
