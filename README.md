# SwiftCommerce - Large-Scale E-Commerce Platform

A production-grade B2C e-commerce platform with comprehensive features for product management, order processing, payments, and administration.

## 🚀 Tech Stack

**Backend:**
- Python FastAPI
- MongoDB (Motor async driver)
- Stripe for payments
- JWT authentication
- Bcrypt password hashing

**Frontend:**
- React 19
- React Router v7
- Tailwind CSS + Shadcn UI
- Axios for API calls
- Stripe React integration

## ✨ Features Implemented (MVP - Phase 1)

### Customer Features
- ✅ User Registration & Login (JWT-based authentication)
- ✅ Browse Products with Categories and Search
- ✅ Product Details with Variants (size, color, storage, etc.)
- ✅ Shopping Cart (persistent, add/update/remove items)
- ✅ Checkout with Stripe Payment Integration
- ✅ Order History & Tracking
- ✅ Coupon/Promo Code Application
- ✅ User Profile Management

### Admin Features
- ✅ Admin Dashboard with Key Metrics
- ✅ Product Management (Create/Edit/Delete, Multi-variant Support)
- ✅ Order Management (View, Update Status, Cancel/Refund)
- ✅ Coupon Management (Percentage/Flat Discounts, Usage Limits)
- ✅ User Management (View, Promote to Admin)
- ✅ Activity Logs (Audit Trail)

### Core Systems
- ✅ Inventory Management (real-time tracking, reserve on checkout)
- ✅ Tax Calculation (10% tax rate)
- ✅ Shipping Rules (free over $100, else $10)
- ✅ Order Lifecycle Management
- ✅ Role-Based Access Control (Customer, Admin, Super Admin)
- ✅ Activity Logging for Audit

## 🔐 Login Credentials

**Admin:**
- Email: `admin@swiftcommerce.com`
- Password: `admin123`

**Customer:**
- Email: `customer@example.com`
- Password: `customer123`

## 📊 Sample Data

Pre-seeded with:
- 6 Products (Laptop, Smartphone, Watch, Headphones, Camera, Shoes)
- 12 Product Variants
- 2 Coupon Codes: `WELCOME10` (10% off), `SAVE50` ($50 flat)

## 🔧 Configuration

### Add Stripe Keys
To enable payments, add your Stripe keys:

**Backend (.env):**
```env
STRIPE_SECRET_KEY="sk_test_your_stripe_key"
```

**Frontend (.env):**
```env
REACT_APP_STRIPE_PUBLIC_KEY="pk_test_your_stripe_key"
```

Get keys from: https://dashboard.stripe.com/apikeys

## 📁 Project Structure

```
/app
├── backend/
│   ├── server.py           # Main FastAPI application
│   ├── seed_data.py        # Database seeding script
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/         # Customer pages
│   │   └── pages/admin/   # Admin pages
│   └── .env              # Frontend environment
```

## 🚦 Quick Start

### Local Development

1. **Backend:**
   ```bash
   cd backend
   python -m uvicorn server:app --reload --host 127.0.0.1 --port 8000
   ```

2. **Frontend:**
   ```bash
   cd frontend
   yarn install
   yarn start
   ```

3. Visit http://localhost:3000 (or 3001 if 3000 is in use)
4. Login with admin/customer credentials above
5. Explore products, add to cart, or manage via admin dashboard

### Production Deployment

**Quick Deploy to Netlify + Railway:**

See detailed guides:
- 📖 [**NETLIFY-DEPLOY.md**](./NETLIFY-DEPLOY.md) - Step-by-step deployment guide (Recommended)
- 📖 [**DEPLOYMENT.md**](./DEPLOYMENT.md) - Comprehensive deployment options

**One-line summary:**
1. Deploy backend on [Railway](https://railway.app) (free tier)
2. Deploy frontend on [Netlify](https://netlify.com) (free tier)
3. Database on [MongoDB Atlas](https://mongodb.com/cloud/atlas) (free tier)

**Time needed:** ~30-45 minutes for complete deployment

## 📈 MVP Completion Status

**Backend:** ✅ 100% Complete
**Frontend:** ✅ 100% Complete
**Testing:** ✅ Verified
**Deployment:** ✅ Ready for Production

### Deployment Files Included

- `netlify.toml` - Netlify configuration for frontend
- `backend/Procfile` - Backend deployment configuration
- `backend/runtime.txt` - Python version specification
- `backend/railway.json` - Railway configuration
- `NETLIFY-DEPLOY.md` - Step-by-step deployment guide
- `DEPLOYMENT.md` - Comprehensive deployment documentation

## 🎯 Future Roadmap

**Phase 2:** Real-time features, Email notifications, Multi-vendor support
**Phase 3:** Analytics, Loyalty program, Mobile app
**Phase 4:** Microservices, AI features, Advanced ML

---

**Built with FastAPI, React, and MongoDB**
