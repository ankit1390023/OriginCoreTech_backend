const path = require('path');

const uploadImage = async (req, res) => {
    if (!req.files || req.files.length == 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    const fileUrls = req.files.map(file => {
        // file.path is like 'uploads/feedImages/feed_unknown_...png'
        // Remove 'uploads/' prefix for the URL
        const relativePath = file.path.replace(/\\/g, '/').replace(/^uploads\//, '').replace(/^uploads\//, '');
        return `${req.protocol}://${req.get('host')}/api/uploads/${relativePath}`;
    });

    res.status(200).json({ url: fileUrls });
};

module.exports = { uploadImage };