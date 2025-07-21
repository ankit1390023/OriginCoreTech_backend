// Utility to parse boolean values from string or boolean
function parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    return false;
}

// Utility to parse JSON fields with error handling
function parseJsonField(field, mustBeArray = false) {
    if (!field) return null;
    let parsed;
    try {
        parsed = typeof field === 'string' ? JSON.parse(field) : field;
        if (mustBeArray && !Array.isArray(parsed)) {
            throw new Error('Field must be an array');
        }
        return parsed;
    } catch (error) {
        throw new Error(`Invalid JSON format${mustBeArray ? ' (must be array)' : ''}: ${error.message}`);
    }
}

// Utility to extract profilePic and logoUrl from req.files array
function extractProfileFiles(filesArray) {
    let profilePic = null;
    let logoUrl = null;
    if (Array.isArray(filesArray)) {
        filesArray.forEach(file => {
            if (file.fieldname === 'profilePic') profilePic = file.path;
            if (file.fieldname === 'logoUrl') logoUrl = file.path;
        });
    }
    return { profilePic, logoUrl };
}

module.exports = {
    parseBoolean,
    parseJsonField,
    extractProfileFiles,
}; 