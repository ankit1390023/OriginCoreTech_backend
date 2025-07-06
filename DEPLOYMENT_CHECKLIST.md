# ✅ Deployment Checklist

## Pre-Deployment
- [ ] Code is working locally
- [ ] All dependencies are in package.json
- [ ] Environment variables are documented
- [ ] Database configuration supports PostgreSQL

## Backend Deployment (Render.com)
- [ ] Create Render account
- [ ] Create PostgreSQL database
- [ ] Save database credentials
- [ ] Push code to GitHub
- [ ] Create Web Service on Render
- [ ] Set environment variables
- [ ] Deploy and test API endpoints

## Frontend Deployment (Vercel.com)
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Set VITE_BASE_URL environment variable
- [ ] Deploy and test frontend

## Post-Deployment
- [ ] Test user registration/login
- [ ] Test job posting functionality
- [ ] Test file uploads
- [ ] Test email functionality
- [ ] Check mobile responsiveness
- [ ] Test all major features

## URLs to Save
- Backend API: `https://your-backend-name.onrender.com`
- Frontend: `https://your-frontend-name.vercel.app`
- Database: `your-db-host.onrender.com`

## Environment Variables Checklist
### Backend (Render)
- [ ] NODE_ENV=production
- [ ] DB_HOST=your_postgres_host
- [ ] DB_USER=your_postgres_user
- [ ] DB_PASSWORD=your_postgres_password
- [ ] DB_NAME=jobmain
- [ ] DB_PORT=5432
- [ ] DB_DIALECT=postgres
- [ ] JWT_SECRET=your_secret_key
- [ ] FRONTEND_URL=https://your-frontend-url.vercel.app

### Frontend (Vercel)
- [ ] VITE_BASE_URL=https://your-backend-url.onrender.com/api

## Troubleshooting
- [ ] Check Render logs for errors
- [ ] Check Vercel logs for errors
- [ ] Verify database connection
- [ ] Test API endpoints manually
- [ ] Check CORS configuration 