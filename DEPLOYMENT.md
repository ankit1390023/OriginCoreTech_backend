# Backend Deployment Guide - Render

## Prerequisites
- GitHub repository with your backend code
- Render account

## Deployment Steps

### 1. Database Setup
1. Go to [render.com](https://render.com)
2. Create a new **PostgreSQL** database
3. Note down the connection details:
   - Host
   - Database name
   - Username
   - Password
   - Port (usually 5432)

### 2. Backend Service Setup
1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `job-backend-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: Leave empty (or `jobbackend` if deploying from root)

### 3. Environment Variables
Add these environment variables in Render:

```
NODE_ENV=production
DB_HOST=your_postgres_host_from_step_1
DB_USER=your_postgres_user_from_step_1
DB_PASSWORD=your_postgres_password_from_step_1
DB_NAME=your_postgres_database_name_from_step_1
DB_PORT=5432
JWT_SECRET=your_secure_random_string_here
FRONTEND_URL=https://origin-core-tech-job-frontend.vercel.app
```

### 4. Database Configuration Update
Since Render provides PostgreSQL, you may need to update your database configuration:

1. Install PostgreSQL driver: `npm install pg`
2. Update `db.js` to use PostgreSQL dialect
3. Update your models if needed

### 5. Deploy
1. Click "Create Web Service"
2. Wait for the build to complete
3. Your API will be available at: `https://your-service-name.onrender.com`

### 6. Update Frontend
Update your frontend environment variable:
```
VITE_BASE_URL=https://your-service-name.onrender.com/api
```

## Troubleshooting
- Check Render logs for any build errors
- Ensure all environment variables are set correctly
- Verify database connection details 