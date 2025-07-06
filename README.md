# Job Backend API

## Setup Instructions

### 1. Environment Variables

Copy the `.env.example` file to `.env` and fill in your actual values:

```bash
cp .env.example .env
```

Required environment variables:
- `JWT_SECRET`: A secure random string for JWT token signing
- `JWT_EXPIRY`: JWT token expiration time (e.g., "24h")
- `EMAIL_USER`: Your Gmail address for sending OTP emails
- `EMAIL_PASS`: Your Gmail app password (not your regular password)

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
npm start
```

## Security Notes

⚠️ **IMPORTANT**: Never commit sensitive information like API keys, passwords, or OAuth credentials to version control.

- The `.env` file is already in `.gitignore` and will not be committed
- Use the `.env.example` file as a template for required environment variables
- If you need to use Google OAuth, create a new project in Google Cloud Console and use those credentials

## Resolving GitHub Push Protection

If you encounter push protection errors due to detected secrets:

1. **Remove secrets from git history** (if they exist):
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch path/to/file/with/secrets' --prune-empty --tag-name-filter cat -- --all
   ```

2. **Force push the cleaned history**:
   ```bash
   git push origin main --force
   ```

3. **Rotate any exposed credentials** immediately

## API Endpoints

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/otp/send` - Send OTP email
- `POST /api/otp/verify` - Verify OTP

For more detailed API documentation, check the routes files in the `routes/` directory. 