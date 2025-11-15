# 🚀 Quick Deployment Guide - FREE Tier

**Total Cost:** $0/month  
**Time Required:** ~20 minutes  
**Services:** Vercel + Render + Supabase

---

## 📋 Prerequisites

- [ ] Git repository (GitHub/GitLab/Bitbucket)
- [ ] Node.js 18+ installed locally
- [ ] Google OAuth credentials (Client ID)
- [ ] Terminal/command line access

---

## 🎯 Deployment Steps (In Order)

### 1. Database Setup (5 minutes)

```bash
# Visit: https://supabase.com/dashboard/sign-up
# 1. Create account (free, no credit card required)
# 2. Click "New Project"
# 3. Fill in:
#    - Name: crimson-club
#    - Database Password: [generate strong password - SAVE THIS!]
#    - Region: Choose closest to your users (e.g., us-east-1)
# 4. Wait 2 minutes for project to initialize
# 5. Go to: Settings > Database > Connection String
# 6. Copy "URI" connection string (postgres://...)
# 7. Replace [YOUR-PASSWORD] with your actual password
```

**✅ Save this connection string securely!**

---

### 2. Backend Deployment (10 minutes)

```bash
# A. Create Render account
# Visit: https://dashboard.render.com/register
# Sign up with GitHub (easiest option)

# B. Create Web Service
# 1. Click "New +" > "Web Service"
# 2. Connect your GitHub repository
# 3. Select "crimson-club" repo
# 4. Fill in:
#    - Name: crimson-club-api
#    - Region: Oregon (or closest to your Supabase region)
#    - Branch: main
#    - Root Directory: (leave empty)
#    - Runtime: Node
#    - Build Command: cd api && npm install && npm run build && npx prisma generate
#    - Start Command: cd api && npm run migrate:deploy && npm run start
# 5. Select: Free plan
# 6. Click "Advanced" > "Add Environment Variable"

# C. Add Environment Variables (one by one):
NODE_ENV=production
PORT=10000
DATABASE_URL=[paste your Supabase connection string]
JWT_SECRET=[run: openssl rand -base64 32 and paste result]
GOOGLE_CLIENT_ID=[your Google OAuth Client ID]
FRONTEND_URL=https://crimson-club-web.vercel.app
LOG_LEVEL=info

# 7. Click "Create Web Service"
# 8. Wait 5-10 minutes for deployment
# 9. Once live, copy your Render URL: https://crimson-club-api.onrender.com
```

**✅ Save your Render URL!**

---

### 3. Frontend Deployment (5 minutes)

```bash
# A. Install Vercel CLI
npm install -g vercel

# B. Login to Vercel
vercel login
# Follow the browser prompt to authenticate

# C. Navigate to frontend directory
cd web

# D. Deploy
vercel --prod

# Answer the prompts:
# ? Set up and deploy "~/Documents/Crimson Club/web"? [Y/n] y
# ? Which scope? [select your account]
# ? Link to existing project? [N/y] n
# ? What's your project's name? crimson-club-web
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] n

# E. Wait for deployment (2-3 minutes)
# F. Copy your Vercel URL from the output

# G. Set environment variables
vercel env add VITE_API_URL production
# When prompted, enter: https://crimson-club-api.onrender.com

vercel env add VITE_GOOGLE_CLIENT_ID production
# When prompted, enter: [your Google OAuth Client ID]

# H. Redeploy with environment variables
vercel --prod
```

**✅ Your app is now live!**

---

### 4. Final Configuration (5 minutes)

```bash
# A. Update Render Backend URL
# 1. Go to Render dashboard: https://dashboard.render.com
# 2. Click your "crimson-club-api" service
# 3. Go to "Environment" tab
# 4. Find FRONTEND_URL variable
# 5. Update value to: https://[your-actual-vercel-url].vercel.app
# 6. Click "Save Changes"
# 7. Wait for redeployment (~2 minutes)

# B. Update Google OAuth Settings
# 1. Go to: https://console.cloud.google.com/apis/credentials
# 2. Click your OAuth 2.0 Client ID
# 3. Under "Authorized JavaScript origins" add:
#    - https://[your-vercel-url].vercel.app
# 4. Under "Authorized redirect URIs" add:
#    - https://[your-vercel-url].vercel.app
# 5. Click "Save"

# C. Test Your Application
# 1. Visit your Vercel URL
# 2. Click "Sign in with Google"
# 3. Complete OAuth flow
# 4. Create a check-in
# 5. Verify data persists
```

**🎉 Deployment Complete!**

---

## 🔍 Verify Everything Works

Run these checks:

```bash
# 1. Backend Health Check
curl https://crimson-club-api.onrender.com/health
# Should return: {"status":"ok","timestamp":"..."}

# 2. Frontend loads
# Visit: https://[your-vercel-url].vercel.app
# Should see login page

# 3. Database connection
# In Supabase dashboard: Tables should appear after first migration

# 4. OAuth works
# Try logging in with Google on your frontend
```

---

## 📊 Your Deployed URLs

Fill these in after deployment:

```
Frontend: https://_____________________________.vercel.app
Backend:  https://_____________________________.onrender.com
Database: https://_____________________________.supabase.co
```

---

## ⚠️ Important Notes

### Cold Starts
- Render free tier sleeps after 15 minutes
- First request takes ~30 seconds to wake up
- **Tip:** Use [cron-job.org](https://cron-job.org) to ping your backend every 14 minutes

### Monitoring Usage
- **Supabase:** Dashboard > Usage (500MB limit)
- **Render:** Dashboard > Metrics (750 hours/month)
- **Vercel:** Dashboard > Usage (100GB bandwidth)

---

## 🆘 Troubleshooting

**Backend not responding?**
- Wait 30-60 seconds (cold start)
- Check Render logs: Dashboard > Your Service > Logs

**OAuth not working?**
- Verify redirect URIs in Google Console match exactly
- Check browser console for errors
- Ensure VITE_GOOGLE_CLIENT_ID is set correctly

**CORS errors?**
- Verify FRONTEND_URL in Render matches your Vercel URL
- No trailing slashes in URLs
- Redeploy backend after changing

**Database errors?**
- Check DATABASE_URL is correct in Render
- Verify Supabase project is active
- Check migrations ran: See Render logs for "Migration successful"

---

## 🔄 Redeploying After Changes

```bash
# Frontend (from web/ directory)
vercel --prod

# Backend (automatic on git push)
git add .
git commit -m "Your changes"
git push origin main
# Render auto-deploys from GitHub
```

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **This Project:** See `/plans/free-tier-deployment.md` for detailed info

---

## ✅ Deployment Checklist

- [ ] Supabase project created and DATABASE_URL obtained
- [ ] Render service created and deployed
- [ ] Environment variables set in Render
- [ ] Backend responding at /health endpoint
- [ ] Vercel CLI installed
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] FRONTEND_URL updated in Render
- [ ] Google OAuth redirect URIs updated
- [ ] Login tested and working
- [ ] Check-in created successfully
- [ ] Data persists in Supabase

---

**🎊 Congratulations! Your app is live on the internet for FREE!**

Share your link: `https://[your-vercel-url].vercel.app`

