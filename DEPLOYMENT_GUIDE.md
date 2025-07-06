# 🚀 Complete Deployment Guide for Beginners

## What You Need to Deploy

Your backend is a Node.js application with:
- Express.js server
- MySQL database (can be switched to PostgreSQL for cloud deployment)
- JWT authentication
- File uploads
- Email functionality

## Step-by-Step Deployment Process

### Step 1: Choose Your Hosting Platform

**Recommended for beginners: Render.com (FREE)**

### Step 2: Prepare Your Database

#### Option A: Use Render's PostgreSQL (Recommended)
1. Go to [render.com](https://render.com)
2. Sign up for a free account
3. Click "New +" → "PostgreSQL"
4. Name it: `job-database`
5. Choose "Free" plan
6. Click "Create Database"
7. **Save these details:**
   - Host: `your-db-host.onrender.com`
   - Database: `jobmain`
   - Username: `your-username`
   - Password: `your-password`
   - Port: `5432`

#### Option B: Use External MySQL (PlanetScale, Railway, etc.)

### Step 3: Deploy Your Backend

1. **Push your code to GitHub:**
   ```bash
   cd jobbackend
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `job-backend-api`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Root Directory**: `jobbackend` (if deploying from root repo)

3. **Set Environment Variables in Render:**
   ```
   NODE_ENV=production
   DB_HOST=your_postgres_host_from_step_2
   DB_USER=your_postgres_user_from_step_2
   DB_PASSWORD=your_postgres_password_from_step_2
   DB_NAME=jobmain
   DB_PORT=5432
   DB_DIALECT=postgres
   JWT_SECRET=your_super_secret_random_string_here
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

4. **Click "Create Web Service"**

### Step 4: Update Database Configuration

Since you're using PostgreSQL on Render, update your `db.js`:

```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'jobmain',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

module.exports = sequelize;
```

### Step 5: Deploy Your Frontend

1. **Deploy on Vercel (Recommended):**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your frontend repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `jobfrontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

2. **Set Environment Variables in Vercel:**
   ```
   VITE_BASE_URL=https://your-backend-url.onrender.com/api
   ```

### Step 6: Test Your Deployment

1. **Test Backend:**
   - Visit: `https://your-backend-url.onrender.com/api/job-roles`
   - Should return JSON data

2. **Test Frontend:**
   - Visit your Vercel URL
   - Try logging in/registering
   - Check if API calls work

### Step 7: Custom Domain (Optional)

1. **Buy a domain** (GoDaddy, Namecheap, etc.)
2. **Configure DNS** to point to your Vercel frontend
3. **Add custom domain** in Vercel settings

## Troubleshooting Common Issues

### Backend Issues:
- **Build fails**: Check if all dependencies are in `package.json`
- **Database connection fails**: Verify environment variables
- **CORS errors**: Check `FRONTEND_URL` in environment variables

### Frontend Issues:
- **API calls fail**: Check `VITE_BASE_URL` environment variable
- **Build fails**: Check for missing dependencies

### Database Issues:
- **Connection timeout**: Check SSL settings for PostgreSQL
- **Migration errors**: Your database will auto-sync on first run

## Security Checklist

- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS (automatic on Render/Vercel)
- [ ] Set proper CORS origins
- [ ] Use environment variables for sensitive data
- [ ] Regular security updates

## Cost Breakdown (Free Tier)

- **Render Backend**: FREE (750 hours/month)
- **Render Database**: FREE (90 days, then $7/month)
- **Vercel Frontend**: FREE
- **Domain**: ~$10-15/year (optional)

## Next Steps After Deployment

1. Set up monitoring (Render/Vercel provide basic logs)
2. Configure email service (Gmail, SendGrid, etc.)
3. Set up backup strategy for database
4. Implement error tracking (Sentry, etc.)

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [Express.js Documentation](https://expressjs.com/)

Your website will be live at: `https://your-frontend-url.vercel.app`
Your API will be at: `https://your-backend-url.onrender.com` 