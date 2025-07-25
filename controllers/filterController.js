const { Domain, Skill } = require('../models');
const {
    allowedJobRoles,
    allowedLocations,
    allowedUserTypes,
    allowedCourses,
    allowedSpecializations,
    allowedColleges,
    durationOptions,
    allowedStartMonths,
    allowedPerks,
    allowedCities
} = require('../constants');

// Static Filters Controllers
const getJobRoles = (req, res) => {
    res.json(allowedJobRoles);
};

const getLocations = (req, res) => {
    res.json(allowedLocations);
};

const getUserTypes = (req, res) => {
    res.json(allowedUserTypes);
};

const getCourses = (req, res) => {
    res.json(allowedCourses);
};

const getSpecializations = (req, res) => {
    res.json(allowedSpecializations);
};

const getColleges = (req, res) => {
    res.json(allowedColleges);
};

// Internship Filter Controller
const getInternshipFilters = async (req, res) => {
    try {
        const domains = await Domain.findAll({ attributes: ['domain_name'] });
        const skills = await Skill.findAll({ attributes: ['skill_name'] });

        // Transform domains and skills to simple arrays
        const domainNames = domains.map(domain => domain.domain_name);
        const skillNames = skills.map(skill => skill.skill_name);

        res.json({
            duration: durationOptions,
            startMonth: allowedStartMonths,
            perks: allowedPerks,
            cities: allowedCities.sort(),
            domains: domainNames.sort(),
            skills: skillNames.sort(),
            courses: allowedCourses,
            colleges: allowedColleges
        });
    } catch (error) {
        console.error('Error fetching filters:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getJobRoles,
    getLocations,
    getUserTypes,
    getCourses,
    getSpecializations,
    getColleges,
    getInternshipFilters
}; 