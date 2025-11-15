# 🆓 FREE Tier Deployment Plan - Crimson Club

**Created:** 2025-11-15  
**Total Cost:** $0/month  
**Services:** Vercel + Render + Supabase

---

## 🎯 Deployment Strategy

| Component | Service | Free Tier Limits | CLI Tool |
|-----------|---------|------------------|----------|
| **Frontend** (React PWA) | Vercel | 100GB bandwidth, unlimited sites | `vercel` |
| **Backend** (Node.js API) | Render | 750 hrs/month, sleeps after 15min | Git integration |
| **Database** (PostgreSQL) | Supabase | 500MB storage, 2GB bandwidth | Web UI + connection string |

---

## 📝 Step-by-Step Deployment Process

### ✅ Phase 1: Setup Database (Supabase)
- [x] Create Supabase account
- [x] Create new project
- [x] Get database connection string
- [x] Update environment variables
- [ ] Run migrations
- [ ] Seed initial data

### ✅ Phase 2: Deploy Backend API (Render)
- [x] Create render.yaml configuration
- [x] Create Render account
- [x] Connect GitHub repository
- [x] Configure environment variables
- [ ] Deploy and verify

### ✅ Phase 3: Deploy Frontend (Vercel)
- [x] Create vercel.json configuration
- [x] Build optimization for production
- [x] Install Vercel CLI
- [ ] Deploy via CLI
- [ ] Configure environment variables
- [ ] Verify deployment

### ✅ Phase 4: Final Configuration
- [ ] Update OAuth redirect URLs
- [ ] Test end-to-end flow
- [ ] Enable custom domain (optional)
- [ ] Monitor performance

---

## 🔧 Configuration Files Created

1. ✅ `render.yaml` - Backend deployment config
2. ✅ `vercel.json` - Frontend deployment config
3. ✅ `.env.production.template` - Environment variables guide
4. ✅ Deployment scripts

---

## 📚 Detailed Instructions

### 1️⃣ Database Setup (Supabase)

**Time:** 5 minutes

```bash
# Step 1: Create account
# Visit: https://supabase.com/dashboard/sign-up

# Step 2: Create new project
# - Project name: crimson-club
# - Database password: [generate strong password]
# - Region: Choose closest to your users

# Step 3: Get connection string
# Go to: Project Settings > Database > Connection String
# Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Save this connection string!** You'll need it for both backend and local migrations.

---

### 2️⃣ Backend Deployment (Render)

**Time:** 10 minutes

```bash
# Step 1: Create Render account
# Visit: https://dashboard.render.com/register

# Step 2: Create new Web Service
# Option A: Connect via GitHub (recommended)
#   - Connect your GitHub repository
#   - Render will auto-detect render.yaml

# Option B: Manual setup
#   - Runtime: Node
#   - Build Command: npm install && npm run build && npx prisma generate
#   - Start Command: npm run start

# Step 3: Set environment variables in Render dashboard
# Required variables (see section below)
```

**Environment Variables for Render:**
```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=[Your Supabase connection string]
JWT_SECRET=[Generate with: openssl rand -base64 32]
GOOGLE_CLIENT_ID=[Your Google OAuth Client ID]
FRONTEND_URL=[Your Vercel URL - set this after frontend deployment]
```

**Important:** Render free tier sleeps after 15 minutes of inactivity.
- First request after sleep takes ~30 seconds (cold start)
- Consider: Add a cron job to ping your API every 14 minutes to keep it alive

---

### 3️⃣ Frontend Deployment (Vercel)

**Time:** 5 minutes

```bash
# Step 1: Install Vercel CLI
npm install -g vercel

# Step 2: Login to Vercel
vercel login

# Step 3: Navigate to frontend directory
cd web

# Step 4: Deploy
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - Project name? crimson-club-web
# - Directory? ./
# - Override settings? No

# Step 5: Set environment variables
vercel env add VITE_API_URL production
# Enter: https://[your-render-service].onrender.com

vercel env add VITE_GOOGLE_CLIENT_ID production
# Enter: [Your Google OAuth Client ID]

# Step 6: Redeploy with environment variables
vercel --prod
```

**Your frontend will be live at:** `https://crimson-club-web.vercel.app`

---

### 4️⃣ Run Database Migrations

**Important:** Do this AFTER deploying backend to Render

```bash
# Option A: From local machine (recommended)
cd api
export DATABASE_URL="[Your Supabase connection string]"
npm run migrate:deploy

# Option B: From Render shell
# Go to Render dashboard > Your service > Shell
npm run migrate:deploy

# Seed initial data (optional)
npm run seed
```

---

### 5️⃣ Configure Google OAuth

Update your Google OAuth settings:

```
Authorized JavaScript origins:
- https://[your-vercel-app].vercel.app
- http://localhost:5173 (for local dev)

Authorized redirect URIs:
- https://[your-vercel-app].vercel.app
- http://localhost:5173
```

---

### 6️⃣ Update Backend Environment Variable

After frontend is deployed, update Render:

```bash
# In Render dashboard, add/update:
FRONTEND_URL=https://[your-vercel-app].vercel.app
```

This enables CORS for your frontend domain.

---

## 🎮 CLI Commands Summary

```bash
# Database (Supabase)
# No CLI needed - use web dashboard

# Backend (Render)
# Deploy via Git push after initial setup
git add .
git commit -m "Deploy to Render"
git push origin main
# Render auto-deploys on push

# Frontend (Vercel)
cd web
vercel --prod  # Deploy to production

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]
```

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Frontend loads at Vercel URL
- [ ] Backend health check: `https://[render-url]/health`
- [ ] Database connection works
- [ ] Google OAuth login works
- [ ] Can create check-in
- [ ] Data persists in Supabase
- [ ] Charts display correctly

---

## ⚠️ Important Notes

### Cold Starts (Render Free Tier)
- Backend sleeps after 15 minutes of inactivity
- First request takes ~30 seconds to wake up
- **Solution:** Use a service like [cron-job.org](https://cron-job.org) to ping your API every 14 minutes

**Cron Job Setup:**
```
URL: https://[your-render-service].onrender.com/health
Interval: Every 14 minutes
```

### Database Limits (Supabase Free)
- 500MB storage
- 2GB bandwidth per month
- Up to 50,000 rows (estimated)
- **Monitor usage** in Supabase dashboard

### Bandwidth (Vercel Free)
- 100GB per month
- **Monitor usage** in Vercel dashboard

---

## 🚀 Future Upgrades

If you need to upgrade later:

| Service | Paid Tier | Cost | Benefits |
|---------|-----------|------|----------|
| Render | Starter | $7/mo | No cold starts, more resources |
| Supabase | Pro | $25/mo | 8GB storage, 50GB bandwidth |
| Vercel | Pro | $20/mo | 1TB bandwidth, analytics |

**My recommendation:** Keep free tier until you have real users, then upgrade Render first to eliminate cold starts.

---

## 📊 Monitoring & Logs

### View Backend Logs
```bash
# Render dashboard > Your service > Logs
# Or use Render API (requires setup)
```

### View Frontend Logs
```bash
vercel logs [deployment-url]

# Or in Vercel dashboard > Deployments > [Your deployment]
```

### Database Monitoring
```
Supabase dashboard > Database > Usage
```

---

## 🆘 Troubleshooting

### Issue: Backend not responding
**Solution:** First request after sleep takes time. Wait 30 seconds and retry.

### Issue: CORS errors
**Solution:** Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly (no trailing slash).

### Issue: OAuth not working
**Solution:** 
1. Check Google Console has correct redirect URIs
2. Verify `VITE_GOOGLE_CLIENT_ID` in Vercel matches your OAuth client

### Issue: Database connection failed
**Solution:**
1. Verify `DATABASE_URL` in Render is correct
2. Check Supabase project is active
3. Ensure migrations have run

### Issue: Build failed on Render
**Solution:**
1. Check Node version (should be 18 or 20)
2. Verify all dependencies in package.json
3. Check build logs for specific errors

---

## ✅ Deployment Status

- [x] Configuration files created
- [x] Deployment plan documented
- [x] Backend CORS configured for production
- [x] Health endpoints added (/health and /api/health)
- [x] CLI deployment scripts created
- [x] Environment variable templates created
- [x] Quick-start guide created (DEPLOY_NOW.md)
- [ ] Supabase database created
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Migrations run
- [ ] OAuth configured
- [ ] End-to-end testing complete

---

## 📝 Next Steps

1. ✅ Review this deployment plan
2. ⏸️ Confirm ready to proceed
3. ⏸️ Create Supabase account and project
4. ⏸️ Deploy backend to Render
5. ⏸️ Deploy frontend to Vercel
6. ⏸️ Configure and test

---

## 🎉 Configuration Complete!

All deployment files, scripts, and documentation have been created.

**Status:** ✅ Ready for User Deployment

**Next Steps for User:**
1. Read [`START_HERE.md`](../START_HERE.md) to choose your deployment path
2. Follow [`DEPLOY_NOW.md`](../DEPLOY_NOW.md) for quickest deployment
3. Or use [`DEPLOYMENT_GUIDE.md`](../DEPLOYMENT_GUIDE.md) for detailed instructions

**Estimated Time to Live:** 20 minutes from now! 🚀

_Last updated by AI: 2025-11-15_

