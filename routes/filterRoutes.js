const express = require('express');
const router = express.Router();
const {
    getJobRoles,
    getLocations,
    getUserTypes,
    getCourses,
    getSpecializations,
    getColleges,
    getInternshipFilters
} = require('../controllers/filterController');

// Static Filters Routes
router.get('/job-roles', getJobRoles);
router.get('/locations', getLocations);
router.get('/user-types', getUserTypes);
router.get('/courses', getCourses);
router.get('/specializations', getSpecializations);
router.get('/colleges', getColleges);

// Internship Filter Route
router.get('/internship-filters', getInternshipFilters);

module.exports = router; 