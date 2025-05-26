const { Domain, Skill } = require('../models');

const getSkillsByDomainName = async (req, res) => {
  try {
    const { domainName } = req.params;

    // Find domain by domain_name
    const domain = await Domain.findOne({ where: { domain_name: domainName } });
    if (!domain) {
      return res.status(404).json({ message: 'Domain not found' });
    }

    // Find skills with matching domain_id
    const skills = await Skill.findAll({
      where: { domain_id: domain.domain_id },
      attributes: ['skill_name']
    });

    const skillNames = skills.map(skill => skill.skill_name);

    return res.json({  skills: skillNames });
  } catch (error) {
    console.error('Error fetching skills by domain name:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getSkillsByDomainName
};
