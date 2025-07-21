require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

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
const filterRoutes = require('./routes/filterRoutes');

// Controller Imports
const { serveCertificate } = require('./controllers/fileController');

const app = express();

//  CORS Setup
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
}));

//  Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




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
app.use('/api', filterRoutes);

//  File upload
const upload = multer({ dest: 'uploads/' });
app.post('/api/upload-skill', upload.any(), uploadSkillController);

// Get user skills with certificate URLs
app.get('/api/user-skills/:userId', getUserSkillsController);

//  Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

//  Specific route for certificate files with better error handling
app.get('api/certificates/:filename', serveCertificate);

module.exports = app;
