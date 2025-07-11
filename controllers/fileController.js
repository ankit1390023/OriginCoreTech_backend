const path = require('path');
const fs = require('fs');

// Serve certificate files with better error handling
const serveCertificate = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', 'certificates', filename);

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
};

module.exports = {
    serveCertificate
}; 