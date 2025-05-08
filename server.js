const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer')
const sequelize = require('./db');
const userRoutes = require('./routes/userRoutes');
const otpRoutes = require('./routes/otpRoutes');
const otpmobileRoutes = require('./routes/otpmobileroute');
const userDetailRoutes = require('./routes/userdetailRoutes');
const uploadSkillController = require('./controllers/userSkillController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use('/api/users', userRoutes);  
app.use('/api/otp', otpRoutes);  
app.use('/api/mobileotp',otpmobileRoutes);   
app.use('/api/user-details', userDetailRoutes);
// Set up multer for handling image uploads
const upload = multer({ dest: 'uploads/' });

// Define the route for uploading skills and call the controller function
app.post('/upload-skill', upload.single('certificate'), uploadSkillController);

(async () => {
  try {
    await sequelize.authenticate();  // Authenticating with the database
    console.log('Database connected.');

    
    await sequelize.sync({ alter: true });

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
  'Noida'
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