#!/bin/bash

# Shopyy Deployment Helper Script
# This script helps you prepare for deployment

echo "🚀 Shopyy Deployment Helper"
echo "=========================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already initialized"
fi

# Check if .gitignore exists
if [ ! -f .gitignore ]; then
    echo "⚠️  Warning: .gitignore not found!"
else
    echo "✅ .gitignore found"
fi

# Build frontend to test
echo ""
echo "🔨 Testing frontend build..."
cd frontend
if yarn build; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed - fix errors before deploying"
    exit 1
fi
cd ..

# Check for environment variables
echo ""
echo "🔍 Checking environment variables..."

if [ -f frontend/.env ]; then
    echo "✅ Frontend .env found"
    if grep -q "REACT_APP_BACKEND_URL" frontend/.env; then
        echo "  ℹ️  Remember to update REACT_APP_BACKEND_URL in Netlify dashboard"
    fi
fi

if [ -f backend/.env ]; then
    echo "✅ Backend .env found"
    echo "  ℹ️  Remember to set environment variables in your backend hosting service"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. BACKEND DEPLOYMENT (Choose one):"
echo "   - Railway: https://railway.app"
echo "   - Render: https://render.com"
echo "   - Heroku: https://heroku.com"
echo ""
echo "2. MONGODB SETUP:"
echo "   - MongoDB Atlas: https://mongodb.com/cloud/atlas"
echo "   - Or use Railway/Render managed MongoDB"
echo ""
echo "3. FRONTEND DEPLOYMENT:"
echo "   - Netlify: https://netlify.com"
echo "   - Run: cd frontend && netlify deploy --prod"
echo ""
echo "4. CONFIGURE ENVIRONMENT VARIABLES:"
echo "   Backend:"
echo "   - MONGO_URL"
echo "   - DB_NAME=ecommerce_db"
echo "   - JWT_SECRET=<random-string>"
echo "   - STRIPE_SECRET_KEY=<your-key>"
echo "   - CORS_ORIGINS=<netlify-url>"
echo ""
echo "   Frontend (Netlify):"
echo "   - REACT_APP_BACKEND_URL=<backend-url>"
echo "   - REACT_APP_STRIPE_PUBLIC_KEY=<your-key>"
echo ""
echo "📖 Full deployment guide: See DEPLOYMENT.md"
echo ""
echo "✨ Good luck with your deployment!"
