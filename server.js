const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer')
const sequelize = require('./db');
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
const { Domain, Skill } = require('./models');  // Added import for Domain and Skill
const universityRoutes = require('./routes/universitydetailRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use('/api/users', userRoutes);  
app.use('/api/otp', otpRoutes);  
app.use('/api/mobileotp',otpmobileRoutes);   
app.use('/api/user-details', userDetailRoutes);
app.use('/api/company-recruiter', companyRecruiterProfileRoutes);
app.use('/api/interview-invitations', interviewInvitationRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/', jobpostRoute);
app.use('/api/feed', feedRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api',universityRoutes);

const upload = multer({ dest: 'uploads/' });
app.post('/upload-skill', upload.any(), uploadSkillController);


(async () => {
  try {
    await sequelize.authenticate();  // Authenticating with the database
    console.log('Database connected.');

    // alter
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('DB connection failed:', err);
  }
})();
const allowedLocations = [
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Gurugram',
  'Noida',
  'Delhi NCR'
];
const allowedJobRoles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'DevOps Engineer',
  'UI/UX Designer'
];


const allowedCourses = ['B.Tech', 'M.Tech', 'BBA', 'MBA', 'MCA', 'Diploma', 'B.Sc', 'BA', 'BE'];
const allowedSpecializations = ['Computer Science', 'Electronics', 'Civil', 'Mechanical', 'IT', 'AI/ML'];
const allowedColleges = ['ABC University', 'XYZ University', 'IIT Delhi', 'NIT Trichy', 'BITS Pilani'];
app.get('/api/job-roles', (req, res) => {
  res.json(allowedJobRoles);
});

app.get('/api/locations', (req, res) => {
  res.json(allowedLocations);
});


app.get('/api/user-types', (req, res) => {
  res.json(allowedUserTypes);
});

app.get('/api/courses', (req, res) => {
  res.json(allowedCourses);
});

app.get('/api/specializations', (req, res) => {
  res.json(allowedSpecializations);
});

app.get('/api/colleges', (req, res) => {
  res.json(allowedColleges);
});

// jobpost data
const durationOptions =
  ['Permanent', '6 Months', '3 Months', '4 Months', '2 Months'];

const allowedStartMonths = ['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'];
const allowedPerks = [
  'Certificate',
  'Letter of recommendation',
  'Flexible work hours',
  '5 days a week',
  'Informal dress code',
  'Free snacks & beverages',
  'Pre-placement offer (PPO)'
];
const allowedCities = [ 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata'];

app.get('/api/internship-filters', async (req, res) => {
  try {
    // Get all domains
    const domains = await Domain.findAll({
      attributes: [ 'domain_name']
    });

    // Get all skills with domain info
    const skills = await Skill.findAll({
      attributes: [ 'skill_name'],
      
    });

    res.json({
      duration: durationOptions,
      startMonth: allowedStartMonths,
      perks: allowedPerks,
      cities: allowedCities,
      domains: domains,
      skills: skills
    });

  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
