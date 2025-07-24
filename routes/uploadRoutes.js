const express = require('express');
const router = express.Router();

const { upload, handleUploadError } = require('../utils/upload');
const { uploadImage } = require('../controllers/imageUploadController');


//POST api/upload-image
router.post('/upload-image', upload, handleUploadError, uploadImage);


module.exports = router;