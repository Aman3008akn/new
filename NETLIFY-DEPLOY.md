# 🚀 Quick Netlify Deployment Guide

This is a step-by-step guide to deploy your Shopyy e-commerce app.

## ⚡ Quick Overview

**What you'll deploy:**
- Frontend on Netlify (free hosting)
- Backend on Railway (free tier available) 
- Database on MongoDB Atlas (free tier)

**Time needed:** 30-45 minutes

---

## Step 1: Deploy Backend on Railway (15 mins)

### 1.1 Create Railway Account
1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway

### 1.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your shopyy repository (or fork it first)
4. Railway will scan and detect your project

### 1.3 Configure Backend Service
1. Click on the detected service
2. Go to "Settings" tab
3. Set **Root Directory**: `backend`
4. Set **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### 1.4 Add MongoDB Database
1. In your project, click "New" → "Database" → "Add MongoDB"
2. Railway will provision a MongoDB instance
3. The connection string will be automatically available as `MONGO_URL`

### 1.5 Set Environment Variables
1. Click on your backend service
2. Go to "Variables" tab
3. Add these variables:

```env
DB_NAME=ecommerce_db
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
CORS_ORIGINS=*
PORT=8000
```

**Note:** Get your Stripe key from https://dashboard.stripe.com/apikeys

### 1.6 Deploy
1. Railway will automatically deploy
2. Wait for deployment to complete (1-2 minutes)
3. Click on your service → "Settings" → "Generate Domain"
4. **Copy this URL** - you'll need it for frontend (e.g., `https://your-app.railway.app`)

### 1.7 Verify Backend
Visit `https://your-app.railway.app/docs` - you should see the FastAPI documentation page.

---

## Step 2: Setup MongoDB Atlas (Alternative - 10 mins)

**If you prefer MongoDB Atlas over Railway's MongoDB:**

### 2.1 Create Account
1. Go to https://mongodb.com/cloud/atlas
2. Sign up for free

### 2.2 Create Cluster
1. Click "Build a Database"
2. Choose "Free" tier (M0)
3. Select a cloud provider and region (closest to you)
4. Click "Create Cluster"

### 2.3 Configure Database Access
1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Create username and password (save these!)
4. Set privileges to "Read and write to any database"

### 2.4 Configure Network Access
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Confirm

### 2.5 Get Connection String
1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Update `MONGO_URL` in Railway environment variables

---

## Step 3: Deploy Frontend on Netlify (10 mins)

### 3.1 Create Netlify Account
1. Go to https://netlify.com
2. Click "Sign up" → "Sign up with GitHub"
3. Authorize Netlify

### 3.2 Create New Site
1. Click "Add new site" → "Import an existing project"
2. Choose "Deploy with GitHub"
3. Authorize and select your repository

### 3.3 Configure Build Settings
Set these build settings:

- **Base directory**: `frontend`
- **Build command**: `yarn build`
- **Publish directory**: `frontend/build`

### 3.4 Add Environment Variables
Click "Show advanced" → "New variable" and add:

```env
REACT_APP_BACKEND_URL=https://your-app.railway.app
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

**Important:** Replace `https://your-app.railway.app` with your Railway URL from Step 1.6

### 3.5 Deploy
1. Click "Deploy site"
2. Wait for build to complete (2-3 minutes)
3. You'll get a random URL like `https://random-name-123.netlify.app`

### 3.6 (Optional) Set Custom Domain
1. Click "Domain settings"
2. Click "Add custom domain"
3. Follow instructions to connect your domain

---

## Step 4: Update CORS Settings (5 mins)

### 4.1 Get Your Netlify URL
Copy your Netlify URL (e.g., `https://your-app.netlify.app`)

### 4.2 Update Backend CORS
1. Go to Railway dashboard
2. Click on your backend service
3. Go to "Variables"
4. Update `CORS_ORIGINS` to:
   ```
   https://your-app.netlify.app,http://localhost:3000
   ```
5. Save - Railway will automatically redeploy

---

## Step 5: Seed Database (5 mins)

### Option A: Using Railway Shell
1. Go to Railway dashboard
2. Click on backend service
3. Click "Settings" → "Service" → "Shell"
4. Run: `python seed_data.py`

### Option B: Create Temporary Endpoint
Add this to your backend temporarily:

```python
@api_router.get("/admin/seed")
async def seed_database():
    from seed_data import seed_all
    await seed_all()
    return {"message": "Database seeded successfully"}
```

Then visit: `https://your-backend.railway.app/api/admin/seed`

**Remember to remove this endpoint after seeding!**

---

## Step 6: Test Your Deployment ✅

### 6.1 Open Your Netlify URL
Visit your Netlify URL in a browser

### 6.2 Test User Registration
1. Click "Sign Up"
2. Create a new account
3. Check if you can login

### 6.3 Test Product Browsing
1. Browse products page
2. View product details
3. Add items to cart

### 6.4 Test Admin Features
Login with:
- Email: `admin@swiftcommerce.com`
- Password: `admin123`

Check:
- Admin dashboard loads
- Products management works
- Orders page accessible

---

## 🐛 Troubleshooting

### Build Failed on Netlify

**Error: "Command failed with exit code 1"**
- Check build logs for specific error
- Ensure all dependencies are in `package.json`
- Try building locally: `cd frontend && yarn build`

**Error: "Module not found"**
- Missing dependency - add to `package.json`
- Run `yarn add <package-name>` locally and push

### Backend Not Responding

**Cannot connect to backend**
1. Check Railway logs for errors
2. Verify backend URL in Netlify environment variables
3. Check CORS settings
4. Ensure backend is running (check Railway dashboard)

**MongoDB Connection Error**
1. Verify `MONGO_URL` is set correctly
2. Check MongoDB Atlas IP whitelist (should include 0.0.0.0/0)
3. Verify database user credentials

### CORS Errors in Browser

**Error: "CORS policy blocked"**
1. Go to Railway → Backend service → Variables
2. Update `CORS_ORIGINS` with your Netlify URL
3. Ensure no trailing slash in URLs
4. Wait for Railway to redeploy

### Payment Not Working

**Stripe not loading**
1. Verify `REACT_APP_STRIPE_PUBLIC_KEY` in Netlify
2. Verify `STRIPE_SECRET_KEY` in Railway
3. Check browser console for errors
4. Ensure Stripe keys match (test keys for test, live keys for production)

---

## 📊 Post-Deployment Checklist

- [ ] Frontend is accessible via Netlify URL
- [ ] Backend API responds at `/docs` endpoint
- [ ] MongoDB is connected and database is seeded
- [ ] User registration works
- [ ] User login works
- [ ] Products are visible
- [ ] Cart functionality works
- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] CORS is configured correctly
- [ ] Stripe keys are set (for payments)
- [ ] Environment variables are set correctly

---

## 🔧 Maintenance & Updates

### Update Frontend
1. Make changes locally
2. Push to GitHub
3. Netlify automatically deploys (if connected to GitHub)

### Update Backend
1. Make changes locally
2. Push to GitHub
3. Railway automatically deploys (if connected to GitHub)

### Manual Deploy
- Netlify: Click "Trigger deploy" in dashboard
- Railway: Git push triggers automatic deploy

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Testing)
- **Netlify**: 100GB bandwidth/month, 300 build minutes
- **Railway**: $5 free credit/month (usually enough for small apps)
- **MongoDB Atlas**: 512MB storage
- **Total**: FREE for small projects

### When to Upgrade
- **Traffic**: >100k visitors/month → Upgrade Netlify
- **Database**: >512MB data → Upgrade MongoDB Atlas
- **Backend**: High usage → Railway Pro

---

## 🎯 Next Steps

1. **Set up custom domain** (optional)
2. **Enable analytics** in Netlify
3. **Set up monitoring** for backend
4. **Configure email notifications**
5. **Add error tracking** (Sentry)
6. **Set up CI/CD** (already automatic with GitHub)

---

## 🆘 Need Help?

- **Railway Docs**: https://docs.railway.app
- **Netlify Docs**: https://docs.netlify.com
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/

---

**Congratulations! Your Shopyy e-commerce platform is now live! 🎉**
