require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const sequelize = require('./db');

// Route Imports
const userRoutes = require('./routes/userRoutes');
const otpRoutes = require('./routes/otpRoutes');
const otpmobileRoutes = require('./routes/otpmobileroute');
const userDetailRoutes = require('./routes/userdetailRoutes');
const uploadSkillController = require('./controllers/userSkillController');
const jobpostRoute = require('./routes/jobpostroute');
const companyRecruiterProfileRoutes = require('./routes/companyRecruiterProfileRoutes');
const interviewInvitationRoutes = require('./routes/interviewInvitationRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const feedRoutes = require('./routes/feedRoutes');
const skillRoutes = require('./routes/skillRoutes');
const universityRoutes = require('./routes/universitydetailRoutes');
const { Domain, Skill } = require('./models'); // Sequelize models

const app = express();
const PORT = process.env.PORT || 5000;

//  CORS Setup
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

//  Middleware
app.use(bodyParser.json());

//  API Routes
app.use('/api/users', userRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/mobileotp', otpmobileRoutes);
app.use('/api/user-details', userDetailRoutes);
app.use('/api/company-recruiter', companyRecruiterProfileRoutes);
app.use('/api/interview-invitations', interviewInvitationRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/', jobpostRoute);
app.use('/api/feed', feedRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api', universityRoutes);

//  File upload
const upload = multer({ dest: 'uploads/' });
app.post('/upload-skill', upload.any(), uploadSkillController);

//  Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

//  Static Filters APIs
const allowedJobRoles = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer', 'UI/UX Designer'];
const allowedLocations = ['Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Gurugram', 'Noida', 'Delhi NCR'];
const allowedUserTypes = ['Student', 'Company', 'University'];
const allowedCourses = ['B.Tech', 'M.Tech', 'BBA', 'MBA', 'MCA', 'Diploma', 'B.Sc', 'BA', 'BE'];
const allowedSpecializations = ['Computer Science', 'Electronics', 'Civil', 'Mechanical', 'IT', 'AI/ML'];
const allowedColleges = ['ABC University', 'XYZ University', 'IIT Delhi', 'NIT Trichy', 'BITS Pilani'];

app.get('/api/job-roles', (req, res) => res.json(allowedJobRoles));
app.get('/api/locations', (req, res) => res.json(allowedLocations));
app.get('/api/user-types', (req, res) => res.json(allowedUserTypes));
app.get('/api/courses', (req, res) => res.json(allowedCourses));
app.get('/api/specializations', (req, res) => res.json(allowedSpecializations));
app.get('/api/colleges', (req, res) => res.json(allowedColleges));

//  Internship Filter with Skills + Domains
const durationOptions = ['Permanent', '6 Months', '3 Months', '4 Months', '2 Months'];
const allowedStartMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const allowedPerks = ['Certificate', 'Letter of recommendation', 'Flexible work hours', '5 days a week', 'Informal dress code', 'Free snacks & beverages', 'Pre-placement offer (PPO)'];
const allowedCities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata'];

app.get('/api/internship-filters', async (req, res) => {
  try {
    const domains = await Domain.findAll({ attributes: ['domain_name'] });
    const skills = await Skill.findAll({ attributes: ['skill_name'] });

    res.json({
      duration: durationOptions,
      startMonth: allowedStartMonths,
      perks: allowedPerks,
      cities: allowedCities,
      domains,
      skills
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//  Sequelize Connect + Start Server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync(); // You can use { alter: true } if needed

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ DB connection failed:', err);
  }
})();
