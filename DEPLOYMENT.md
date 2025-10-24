# Deployment Guide - Netlify & Backend Hosting

This guide will help you deploy your Shopyy e-commerce application to production.

## 🎯 Deployment Architecture

Since Netlify is optimized for static sites and frontend applications, we'll use a split deployment:

1. **Frontend**: Deploy on Netlify
2. **Backend**: Deploy on a backend hosting service (Railway, Render, or Heroku)

---

## 📦 Part 1: Deploy Backend (FastAPI)

You have several options for deploying the FastAPI backend:

### Option A: Railway (Recommended - Free Tier Available)

1. **Sign up**: Go to [railway.app](https://railway.app) and sign up with GitHub
2. **Create new project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select repository**: Choose your shopyy repository
4. **Configure**:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. **Add MongoDB**: Click "New" → "Database" → "Add MongoDB"
6. **Set environment variables** in Railway dashboard:
   ```
   MONGO_URL=<Railway will provide this automatically>
   DB_NAME=ecommerce_db
   JWT_SECRET=<generate-a-strong-random-string>
   STRIPE_SECRET_KEY=<your-stripe-secret-key>
   CORS_ORIGINS=<your-netlify-url>
   ```
7. **Deploy**: Railway will automatically deploy
8. **Get URL**: Copy the deployment URL (e.g., `https://your-app.railway.app`)

### Option B: Render (Free Tier Available)

1. **Sign up**: Go to [render.com](https://render.com)
2. **New Web Service**: Click "New" → "Web Service"
3. **Connect repository**: Link your GitHub repository
4. **Configure**:
   - Name: `shopyy-backend`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. **Add MongoDB**: Use Render's free MongoDB or MongoDB Atlas
6. **Set environment variables**
7. **Deploy**

### Option C: Heroku

1. Create `Procfile` in backend directory:
   ```
   web: uvicorn server:app --host 0.0.0.0 --port $PORT
   ```
2. Create `runtime.txt` in backend directory:
   ```
   python-3.11.9
   ```
3. Deploy using Heroku CLI or GitHub integration

---

## 🎨 Part 2: Deploy Frontend on Netlify

### Step 1: Prepare Your Repository

1. **Push to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 2: Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub (recommended)

### Step 3: Deploy on Netlify

**Method A: Via Netlify Dashboard (Recommended)**

1. Click "Add new site" → "Import an existing project"
2. Choose "Deploy with GitHub"
3. Select your repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `yarn build`
   - **Publish directory**: `frontend/build`
   - **Node version**: 22
5. Click "Show advanced" → "New variable" to add environment variables:
   ```
   REACT_APP_BACKEND_URL=<your-backend-url-from-step-1>
   REACT_APP_STRIPE_PUBLIC_KEY=<your-stripe-public-key>
   REACT_APP_ENABLE_VISUAL_EDITS=false
   ENABLE_HEALTH_CHECK=false
   ```
6. Click "Deploy site"

**Method B: Via Netlify CLI**

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

4. Initialize and deploy:
   ```bash
   netlify init
   netlify deploy --prod
   ```

### Step 4: Configure Environment Variables

After deployment, go to:
- **Site settings** → **Environment variables**
- Add the following:

```
REACT_APP_BACKEND_URL=https://your-backend-url.railway.app
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

### Step 5: Update Backend CORS

Update your backend `.env` to allow your Netlify domain:

```env
CORS_ORIGINS=https://your-app.netlify.app,http://localhost:3000,http://localhost:3001
```

Redeploy the backend after this change.

---

## 🔐 Part 3: Configure MongoDB

### Option A: MongoDB Atlas (Recommended - Free Tier)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses (or allow all: 0.0.0.0/0)
5. Get connection string
6. Update `MONGO_URL` in your backend environment variables

### Option B: Use Railway/Render MongoDB

Both Railway and Render offer managed MongoDB as add-ons.

---

## 📝 Part 4: Seed Database

After deploying backend with MongoDB:

1. **Create seed script endpoint** (already in your code)
2. **SSH into your backend** or create a temporary endpoint:
   ```python
   @app.get("/admin/seed-database")
   async def seed_database():
       # Run your seed_data.py logic here
       pass
   ```
3. **Visit the endpoint** once to populate data
4. **Remove the endpoint** for security

Or run locally:
```bash
python seed_data.py
```

---

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed on Netlify
- [ ] Backend deployed on Railway/Render/Heroku
- [ ] MongoDB database created and connected
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] Database seeded with initial data
- [ ] Stripe keys configured (both frontend and backend)
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS enabled (automatic on Netlify)
- [ ] Test complete user flow (register → browse → cart → checkout)

---

## 🔄 Continuous Deployment

Both Netlify and Railway/Render support automatic deployments:

- **Push to main branch** → Automatic deployment
- **Pull request** → Preview deployment (Netlify)

---

## 🐛 Troubleshooting

### Build Fails on Netlify
- Check build logs
- Ensure all dependencies are in `package.json`
- Verify Node version matches local environment

### Backend Connection Failed
- Check CORS settings
- Verify backend URL in frontend env variables
- Check backend logs for errors

### Database Connection Issues
- Verify MongoDB connection string
- Check IP whitelist settings
- Ensure database user has correct permissions

---

## 📊 Monitoring & Analytics

### Netlify
- Built-in analytics available
- Form submissions tracking
- Performance monitoring

### Backend
- Use service logs (Railway/Render dashboard)
- Consider Sentry for error tracking
- Set up uptime monitoring (UptimeRobot, etc.)

---

## 💰 Cost Estimate

### Free Tier (Good for Testing)
- Netlify: Free (100GB bandwidth/month)
- Railway: $5 credit/month (enough for small apps)
- Render: Free tier available
- MongoDB Atlas: Free tier (512MB)

### Production (Recommended)
- Netlify Pro: $19/month
- Railway: ~$10-20/month
- MongoDB Atlas: $9/month (M2 cluster)
- **Total**: ~$40-50/month

---

## 🚀 Quick Deploy Commands

```bash
# Frontend (from project root)
cd frontend
netlify deploy --prod

# Backend (Railway CLI)
cd backend
railway login
railway up
```

---

## 🔗 Useful Links

- [Netlify Documentation](https://docs.netlify.com/)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Guide](https://www.mongodb.com/docs/atlas/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

**Need help?** Check the logs first, then refer to the documentation links above.
