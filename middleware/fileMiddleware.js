// File serving middleware
const serveUploadedFiles = (req, res, next) => {
    // Set proper MIME types for different file types
    if (req.path.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
    } else if (req.path.endsWith('.jpg') || req.path.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
    } else if (req.path.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
    } else if (req.path.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif');
    }

    // Allow cross-origin requests for certificate files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    next();
};

module.exports = {
    serveUploadedFiles
}; 