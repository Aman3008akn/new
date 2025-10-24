# Railway Configuration for Backend

This file is used by Railway to automatically detect and deploy the backend.

## Automatic Detection

Railway will automatically:
- Detect Python application
- Install dependencies from requirements.txt
- Run the start command

## Manual Configuration (if needed)

If Railway doesn't auto-detect, configure these settings in the Railway dashboard:

**Build Command:**
```
pip install -r requirements.txt
```

**Start Command:**
```
uvicorn server:app --host 0.0.0.0 --port $PORT
```

**Root Directory:**
```
backend
```

## Environment Variables

Set these in Railway dashboard:

```
MONGO_URL=<your-mongodb-connection-string>
DB_NAME=ecommerce_db
JWT_SECRET=<generate-strong-random-string-here>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
CORS_ORIGINS=https://your-app.netlify.app,http://localhost:3000
PORT=8000
```

## Health Check

Railway will automatically check `http://your-app.railway.app/docs` for health.

## Deployment

1. Push your code to GitHub
2. Connect Railway to your GitHub repository
3. Railway will automatically deploy
4. Get your deployment URL
5. Update frontend environment variables with this URL
