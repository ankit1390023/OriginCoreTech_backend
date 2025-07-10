require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const sequelize = require('./db');
const fs = require('fs'); // Added for file existence check

// Route Imports
const userRoutes = require('./routes/userRoutes');
const otpRoutes = require('./routes/otpRoutes');
const otpmobileRoutes = require('./routes/otpmobileroute');
const userDetailRoutes = require('./routes/userdetailRoutes');
const { uploadSkillController, getUserSkillsController } = require('./controllers/userSkillController');
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
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
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
app.post('/api/upload-skill', upload.any(), uploadSkillController);

// Get user skills with certificate URLs
app.get('/api/user-skills/:userId', getUserSkillsController);

//  Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ message: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

//  Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    // Set proper MIME types for different file types
    if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    }
    // Allow cross-origin requests for certificate files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

//  Specific route for certificate files with better error handling
app.get('/certificates/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', 'certificates', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Certificate file not found' });
  }

  // Set proper headers based on file extension
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') {
    res.setHeader('Content-Type', 'application/pdf');
  } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
    res.setHeader('Content-Type', `image/${ext.slice(1)}`);
  }

  res.sendFile(filePath);
});

//Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Static Filters APIs
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

// Internship Filter with Skills + Domains
const durationOptions = ['Permanent', '6 Months', '3 Months', '4 Months', '2 Months'];
const allowedStartMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const allowedPerks = ['Certificate', 'Letter of recommendation', 'Flexible work hours', '5 days a week', 'Informal dress code', 'Free snacks & beverages', 'Pre-placement offer (PPO)'];
const allowedCities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata'];

app.get('/api/internship-filters', async (req, res) => {
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
});

// Sequelize Connect + Start Server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    //await sequelize.sync(); // You can use { alter: true } if needed

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ DB connection failed:', err);
  }
})();
