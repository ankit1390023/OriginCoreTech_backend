#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
    echo "✅ Git repository initialized"
else
    echo "📁 Git repository already exists"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Please create a .env file with the following variables:"
    echo ""
    echo "DB_HOST=your_database_host"
    echo "DB_USER=your_database_user"
    echo "DB_PASSWORD=your_database_password"
    echo "DB_NAME=jobmain"
    echo "DB_PORT=5432"
    echo "DB_DIALECT=postgres"
    echo "JWT_SECRET=your_super_secret_jwt_key"
    echo "FRONTEND_URL=https://your-frontend-url.vercel.app"
    echo "NODE_ENV=production"
    echo ""
    echo "🔗 Then proceed with deployment on Render.com"
else
    echo "✅ .env file found"
fi

echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "   git push -u origin main"
echo ""
echo "2. Deploy on Render.com:"
echo "   - Go to render.com and sign up"
echo "   - Create a PostgreSQL database"
echo "   - Create a Web Service"
echo "   - Set environment variables"
echo ""
echo "3. Deploy frontend on Vercel.com"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions" 