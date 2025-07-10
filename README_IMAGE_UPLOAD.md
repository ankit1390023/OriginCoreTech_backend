# Company Recruiter Profile Image Upload

This document explains how image uploads work for company recruiter profiles.

## Overview

The company recruiter profile now supports image uploads for:
- **Profile Picture** (`profilePic`): Personal profile image
- **Company Logo** (`logoUrl`): Company logo image

## File Storage

Images are stored in the following directories:
- Profile pictures: `uploads/profilePics/`
- Company logos: `uploads/logos/`

## API Endpoints

### Create Profile with Images (File Upload)
```
POST /api/company-recruiter/profile/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- profilePic: [image file] (optional)
- logoUrl: [image file] (optional)
- designation: string
- companyName: string
- industry: string
- location: string
- about: string
- hiringPreferences: string
- languagesKnown: string
- isEmailVerified: boolean
- isPhoneVerified: boolean
- isGstVerified: boolean
```

### Create Profile with URLs (Backward Compatibility)
```
POST /api/company-recruiter/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "profilePic": "https://example.com/profile.jpg",
  "logoUrl": "https://example.com/logo.png",
  "designation": "HR Manager",
  "companyName": "Tech Corp",
  "industry": "Technology",
  "location": "New York",
  "about": "About the company...",
  "hiringPreferences": "Full-time",
  "languagesKnown": "English, Spanish",
  "isEmailVerified": true,
  "isPhoneVerified": true,
  "isGstVerified": false
}
```

### Update Profile with Images (File Upload)
```
PUT /api/company-recruiter/profile/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- profilePic: [image file] (optional)
- logoUrl: [image file] (optional)
- designation: string
- companyName: string
- industry: string
- location: string
- about: string
- hiringPreferences: string
- languagesKnown: string
- isEmailVerified: boolean
- isPhoneVerified: boolean
- isGstVerified: boolean
```

### Update Profile with URLs (Backward Compatibility)
```
PUT /api/company-recruiter/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "profilePic": "https://example.com/profile.jpg",
  "logoUrl": "https://example.com/logo.png",
  "designation": "HR Manager",
  "companyName": "Tech Corp",
  "industry": "Technology",
  "location": "New York",
  "about": "About the company...",
  "hiringPreferences": "Full-time",
  "languagesKnown": "English, Spanish",
  "isEmailVerified": true,
  "isPhoneVerified": true,
  "isGstVerified": false
}
```

## File Requirements

- **Supported formats**: JPEG, JPG, PNG, GIF
- **Maximum file size**: 5MB per file
- **File naming**: Automatically generated with format: `{type}_{userId}_{timestamp}.{extension}`

## Response Format

### Success Response
```json
{
  "id": 1,
  "userId": 123,
  "recruiterName": "John Doe",
  "recruiterEmail": "john@company.com",
  "recruiterPhone": "+1234567890",
  "designation": "HR Manager",
  "companyName": "Tech Corp",
  "industry": "Technology",
  "location": "New York",
  "about": "About the company...",
  "logoUrl": "uploads/logos/logo_123_1703123456789.jpg",
  "profilePic": "uploads/profilePics/profile_123_1703123456789.png",
  "hiringPreferences": "Full-time",
  "languagesKnown": "English, Spanish",
  "isEmailVerified": true,
  "isPhoneVerified": true,
  "isGstVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Error Responses

#### File Too Large
```json
{
  "message": "File too large. Maximum size is 5MB."
}
```

#### Invalid File Type
```json
{
  "message": "Only images are allowed"
}
```

#### File Upload Error
```json
{
  "message": "File upload error: [specific error]"
}
```

## Accessing Uploaded Images

Images can be accessed via the static file server:
- Profile picture: `http://localhost:5000/uploads/profilePics/profile_123_1703123456789.png`
- Company logo: `http://localhost:5000/uploads/logos/logo_123_1703123456789.jpg`

## Frontend Implementation Examples

### Using FormData for file upload (New)
```javascript
const formData = new FormData();
formData.append('designation', 'HR Manager');
formData.append('companyName', 'Tech Corp');
formData.append('industry', 'Technology');
formData.append('location', 'New York');
formData.append('about', 'About the company...');

// Add image files if selected
if (profilePicFile) {
  formData.append('profilePic', profilePicFile);
}
if (logoFile) {
  formData.append('logoUrl', logoFile);
}

const response = await fetch('/api/company-recruiter/profile/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Using JSON for URL submission (Backward Compatibility)
```javascript
const profileData = {
  designation: 'HR Manager',
  companyName: 'Tech Corp',
  industry: 'Technology',
  location: 'New York',
  about: 'About the company...',
  profilePic: 'https://example.com/profile.jpg',
  logoUrl: 'https://example.com/logo.png',
  hiringPreferences: 'Full-time',
  languagesKnown: 'English, Spanish',
  isEmailVerified: true,
  isPhoneVerified: true,
  isGstVerified: false
};

const response = await fetch('/api/company-recruiter/profile', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(profileData)
});
```

## Error Handling

The system includes comprehensive error handling for:
- File size limits
- Invalid file types
- Missing directories
- Upload failures
- Database errors

## Security Features

- File type validation (images only)
- File size limits (5MB max)
- Secure file naming with timestamps
- User-specific file organization
- CORS headers for image access 