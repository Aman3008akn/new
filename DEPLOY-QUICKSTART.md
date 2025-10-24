# 🚀 Deployment Quick Reference Card

## 📋 Pre-Deployment Checklist

### Before You Start
- [ ] Code pushed to GitHub
- [ ] Local build tested (`cd frontend && yarn build`)
- [ ] Stripe account created (https://stripe.com)
- [ ] Accounts created:
  - [ ] Netlify (https://netlify.com)
  - [ ] Railway (https://railway.app)
  - [ ] MongoDB Atlas (https://mongodb.com/cloud/atlas) - Optional

---

## 🎯 Deployment Steps (30-45 mins)

### 1️⃣ Backend - Choose Your Platform (15 mins)

**Recommended Options:**
- 🌟 **Railway** - Easiest (built-in MongoDB)
- ⚡ **Render** - Best free tier
- 🚀 **Vercel** - Serverless
- 🐳 **Google Cloud Run** - Container-based
- 🌐 **Fly.io** - Edge computing

**See full comparison:** `backend/BACKEND-HOSTING-OPTIONS.md`

**Quick Setup (Railway):**
```
1. Login to Railway with GitHub
2. New Project → Deploy from GitHub repo
3. Select repository
4. Configure:
   - Root Directory: backend
   - Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
5. Add MongoDB (New → Database → MongoDB)
6. Set environment variables (see below)
7. Generate domain and copy URL
```

**Environment Variables for Railway:**
```env
DB_NAME=ecommerce_db
JWT_SECRET=<random-string>
STRIPE_SECRET_KEY=sk_test_xxx
CORS_ORIGINS=*
PORT=8000
```

---

### 2️⃣ Frontend (Netlify) - 10 mins

```
1. Login to Netlify with GitHub
2. Add new site → Import from GitHub
3. Select repository
4. Configure:
   - Base directory: frontend
   - Build command: yarn build
   - Publish directory: frontend/build
5. Add environment variables (see below)
6. Deploy site
7. Copy Netlify URL
```

**Environment Variables for Netlify:**
```env
REACT_APP_BACKEND_URL=<railway-backend-url>
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxx
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

---

### 3️⃣ Update CORS - 2 mins

```
1. Go to Railway backend service
2. Variables → Edit CORS_ORIGINS
3. Set to: https://your-app.netlify.app
4. Save (auto-redeploys)
```

---

### 4️⃣ Seed Database - 5 mins

**Option 1: Railway Shell**
```bash
python seed_data.py
```

**Option 2: Temporary endpoint**
Visit: `https://your-backend.railway.app/api/admin/seed`
(Remove endpoint after!)

---

## ✅ Verification

### Test Backend
- [ ] Visit: `https://your-backend.railway.app/docs`
- [ ] Should see FastAPI docs

### Test Frontend  
- [ ] Visit your Netlify URL
- [ ] Register new account
- [ ] Login works
- [ ] Products load
- [ ] Add to cart works
- [ ] Admin login works

---

## 🔑 Important URLs

**Get These:**
- Stripe Keys: https://dashboard.stripe.com/apikeys
- Railway Dashboard: https://railway.app/dashboard
- Netlify Dashboard: https://app.netlify.com
- MongoDB Atlas: https://cloud.mongodb.com

**Save These:**
- Backend URL (Railway): ___________________________
- Frontend URL (Netlify): ___________________________
- MongoDB Connection String: ___________________________

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails on Netlify | Check build logs, verify `package.json` |
| Backend not responding | Check Railway logs, verify env vars |
| CORS error | Update CORS_ORIGINS in Railway |
| DB connection error | Check MONGO_URL, verify IP whitelist |
| Stripe not working | Verify both public and secret keys |

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Netlify Docs**: https://docs.netlify.com  
- **Full Guide**: See NETLIFY-DEPLOY.md
- **Detailed Options**: See DEPLOYMENT.md

---

## 💰 Free Tier Limits

- **Netlify**: 100GB bandwidth/month ✅
- **Railway**: $5 credit/month ✅
- **MongoDB Atlas**: 512MB storage ✅

**Total Cost: $0 for testing/small projects**

---

## 🎉 You're Ready!

Follow the steps above and you'll have your app deployed in 30-45 minutes.

**Detailed walkthrough:** Open `NETLIFY-DEPLOY.md`
