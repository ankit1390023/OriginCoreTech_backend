const express = require('express');
const router = express.Router();
const { getSkillsByDomainName } = require('../controllers/skillController');

router.get('/by-domain/:domainName', getSkillsByDomainName);

module.exports = router;
