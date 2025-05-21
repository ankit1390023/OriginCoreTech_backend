const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createAssignment } = require('../controllers/assignmentController');
const authMiddleware = require('../middleware/authMiddleware');


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // upload directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Routes
router.post('/:applicationId',authMiddleware, upload.single('fileUpload'), createAssignment);

module.exports = router;
