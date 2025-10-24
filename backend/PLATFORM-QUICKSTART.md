# 🚀 Platform-Specific Quick Deployment Guides

Choose your backend hosting platform and follow the steps below.

---

## 🌟 Option 1: Railway (Easiest - Recommended)

**Time:** 10 minutes | **Cost:** FREE ($5 credit/month)

### Steps:
1. Go to [railway.app](https://railway.app)
2. Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Python
6. Click "Add variables" and set:
   ```
   DB_NAME=ecommerce_db
   JWT_SECRET=your-random-secret-string
   STRIPE_SECRET_KEY=sk_test_xxx
   CORS_ORIGINS=*
   ```
7. Click "New" → "Database" → "Add MongoDB"
8. Click "Settings" → "Generate Domain"
9. ✅ Done! Copy your URL

**Files used:** `Procfile`, `runtime.txt`

---

## ⚡ Option 2: Render (Best Free Tier)

**Time:** 15 minutes | **Cost:** FREE (with sleep) or $7/month

### Steps:
1. Go to [render.com](https://render.com)
2. Login with GitHub
3. Click "New" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name:** shopyy-backend
   - **Root Directory:** backend
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
6. Add environment variables (see Railway list above)
7. Click "Create Web Service"
8. ✅ Done! Copy your URL

**Files used:** `render.yaml` (optional), `Procfile`, `runtime.txt`

---

## 🚀 Option 3: Vercel (Serverless)

**Time:** 10 minutes | **Cost:** FREE

### Steps:
1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to backend: `cd backend`
3. Login: `vercel login`
4. Set secrets:
   ```bash
   vercel secrets add mongo-url "your-mongodb-url"
   vercel secrets add jwt-secret "your-secret"
   vercel secrets add stripe-secret "sk_test_xxx"
   ```
5. Deploy: `vercel --prod`
6. ✅ Done! Copy your URL

**Files used:** `vercel.json`

**Note:** Requires external MongoDB (MongoDB Atlas recommended)

---

## 🐳 Option 4: Google Cloud Run (Container)

**Time:** 20 minutes | **Cost:** FREE (2M requests/month)

### Prerequisites:
- Google Cloud account
- gcloud CLI installed

### Steps:
1. Install gcloud: https://cloud.google.com/sdk/docs/install
2. Login: `gcloud auth login`
3. Create project: `gcloud projects create shopyy-backend`
4. Set project: `gcloud config set project shopyy-backend`
5. Navigate to backend: `cd backend`
6. Deploy:
   ```bash
   gcloud run deploy shopyy-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars="DB_NAME=ecommerce_db" \
     --set-secrets="MONGO_URL=mongo-url:latest" \
     --set-secrets="JWT_SECRET=jwt-secret:latest" \
     --set-secrets="STRIPE_SECRET_KEY=stripe-key:latest"
   ```
7. Set secrets in Google Cloud Console
8. ✅ Done! Copy your URL

**Files used:** `Dockerfile`

---

## 🌐 Option 5: Fly.io (Edge Computing)

**Time:** 15 minutes | **Cost:** FREE (3 VMs)

### Steps:
1. Install Fly CLI:
   - Windows: `powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"`
   - Mac/Linux: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Navigate to backend: `cd backend`
4. Launch: `fly launch`
   - Choose app name
   - Select region
   - Don't deploy yet
5. Set secrets:
   ```bash
   fly secrets set MONGO_URL="your-mongodb-url"
   fly secrets set JWT_SECRET="your-secret"
   fly secrets set STRIPE_SECRET_KEY="sk_test_xxx"
   fly secrets set CORS_ORIGINS="*"
   ```
6. Deploy: `fly deploy`
7. ✅ Done! Copy your URL: `https://your-app.fly.dev`

**Files used:** `fly.toml`, `Dockerfile`

---

## 🔷 Option 6: DigitalOcean App Platform

**Time:** 15 minutes | **Cost:** $4/month minimum

### Steps:
1. Go to [digitalocean.com](https://digitalocean.com)
2. Login and go to Apps section
3. Click "Create App"
4. Connect GitHub repository
5. Configure:
   - **Source Directory:** backend
   - **Build Command:** `pip install -r requirements.txt`
   - **Run Command:** `uvicorn server:app --host 0.0.0.0 --port 8080`
6. Add environment variables
7. Choose plan (Basic $4/month)
8. Deploy
9. ✅ Done! Copy your URL

**Files used:** `app.yaml` (optional)

---

## 📊 Quick Comparison

| Platform | Setup Time | Free Tier | Best For |
|----------|-----------|-----------|----------|
| Railway | 10 min | $5 credit | Beginners |
| Render | 15 min | Yes (sleep) | Production |
| Vercel | 10 min | Generous | Serverless |
| Cloud Run | 20 min | 2M requests | Scale |
| Fly.io | 15 min | 3 VMs | Global |
| DigitalOcean | 15 min | No | Traditional |

---

## 🗂️ Configuration Files Reference

All configuration files are in the `backend/` directory:

- **Railway/Render/Heroku:**
  - `Procfile` ✅
  - `runtime.txt` ✅
  - `railway.json` ✅
  - `render.yaml` ✅

- **Vercel:**
  - `vercel.json` ✅

- **Docker-based (Cloud Run, Fly.io):**
  - `Dockerfile` ✅
  - `.dockerignore` ✅
  - `fly.toml` ✅

- **DigitalOcean:**
  - `app.yaml` ✅

---

## 🎯 Recommended Choice

**For your first deployment:**
→ Start with **Railway** (easiest setup, built-in MongoDB)

**For production:**
→ Use **Render** (best free tier) or **Cloud Run** (best scaling)

**For global users:**
→ Use **Fly.io** (edge computing)

**For learning:**
→ Try **Vercel** (serverless experience)

---

## 🔄 After Deployment

1. **Copy your backend URL** from whichever platform you chose
2. **Update frontend environment variables** in Netlify:
   - `REACT_APP_BACKEND_URL=<your-backend-url>`
3. **Update CORS** in backend environment variables:
   - `CORS_ORIGINS=https://your-app.netlify.app`
4. **Seed the database** (see deployment guide)
5. **Test everything!**

---

## 🆘 Platform-Specific Help

- **Railway:** https://docs.railway.app
- **Render:** https://render.com/docs
- **Vercel:** https://vercel.com/docs/frameworks/fastapi
- **Google Cloud:** https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-python-service
- **Fly.io:** https://fly.io/docs/languages-and-frameworks/python/
- **DigitalOcean:** https://docs.digitalocean.com/products/app-platform/

---

**All platforms are production-ready! Choose based on your preferences.** 🚀
