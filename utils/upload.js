const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create different folders for different file types
        if (file.fieldname === 'profilePic') {
            cb(null, 'uploads/profilePics/');
        } else if (file.fieldname === 'logoUrl') {
            cb(null, 'uploads/logos/');
        } else {
            cb(null, 'uploads/');
        }
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const userId = req.user ? req.user.id : 'unknown';

        if (file.fieldname === 'profilePic') {
            cb(null, 'profile_' + userId + '_' + timestamp + ext);
        } else if (file.fieldname === 'logoUrl') {
            cb(null, 'logo_' + userId + '_' + timestamp + ext);
        } else {
            cb(null, file.fieldname + '_' + userId + '_' + timestamp + ext);
        }
    }
});

// Enhanced multer configuration to handle both files and text fields
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        // Only apply file filter to image files
        if (file.fieldname === 'profilePic' || file.fieldname === 'logoUrl') {
            const allowedTypes = /jpeg|jpg|png|gif/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedTypes.test(file.mimetype);
            if (extname && mimetype) {
                return cb(null, true);
            } else {
                cb(new Error('Only images are allowed for profilePic and logoUrl'));
            }
        } else {
            // Allow all other fields (text fields)
            cb(null, true);
        }
    }
}).any(); // Use .any() to handle all fields, both files and text

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: 'File upload error: ' + err.message });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

module.exports = {
    storage,
    upload,
    handleUploadError,
}; 