# 🚀 Deploy Crimson Club - Quick Start (FREE)

**⏱️ Time Required:** 20 minutes  
**💰 Cost:** $0/month  
**🛠️ Difficulty:** Easy

---

## 🎯 What You'll Get

✅ Live web app accessible from anywhere  
✅ Google OAuth login  
✅ PostgreSQL database  
✅ Automatic HTTPS  
✅ Auto-deployment on git push  

---

## 📋 Before You Start

Make sure you have:
- [ ] A GitHub account (where your code will be)
- [ ] A Google Cloud Project with OAuth credentials
- [ ] Node.js 18+ installed
- [ ] 20 minutes of focused time

---

## 🎬 Step-by-Step Deployment

### 1. Push Your Code to GitHub (5 min)

```bash
# If not already done
git add .
git commit -m "Prepare for deployment"

# Create a new GitHub repo at: https://github.com/new
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/crimson-club.git
git branch -M main
git push -u origin main
```

---

### 2. Setup Database - Supabase (3 min)

```bash
# 1. Go to: https://supabase.com/dashboard/sign-up
# 2. Sign up (free, no credit card)
# 3. Click "New Project"
# 4. Enter:
#    - Name: crimson-club
#    - Password: [generate and SAVE IT!]
#    - Region: US East (or closest to you)
# 5. Wait 2 minutes for setup
# 6. Go to: Settings > Database > Connection String
# 7. Copy the URI and replace [YOUR-PASSWORD] with your actual password
```

**Save this for next step:**
```
postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

---

### 3. Deploy Backend - Render (6 min)

```bash
# 1. Go to: https://dashboard.render.com/register
# 2. Sign up with GitHub
# 3. Click "New +" > "Web Service"
# 4. Click "Connect GitHub" > Select your crimson-club repo
# 5. Fill in:
#    - Name: crimson-club-api
#    - Region: Oregon
#    - Branch: main
#    - Root Directory: (leave blank)
#    - Runtime: Node
#    - Build Command: 
cd api && npm install && npm run build && npx prisma generate
#    - Start Command:
cd api && npm run migrate:deploy && npm run start
#    - Instance Type: Free
```

**Add Environment Variables:**
Click "Advanced" > "Add Environment Variable"

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET=[click terminal and run: openssl rand -base64 32, paste result]
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
FRONTEND_URL=https://crimson-club-web.vercel.app
LOG_LEVEL=info
```

**Deploy:**
- Click "Create Web Service"
- Wait 5 minutes
- **Copy your URL:** `https://crimson-club-api.onrender.com`

---

### 4. Deploy Frontend - Vercel (4 min)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login
# (Opens browser - authenticate)

# Navigate to frontend
cd web

# Deploy
vercel --prod

# Answer prompts:
# ? Set up and deploy? Yes
# ? Which scope? [Your account]
# ? Link to existing? No
# ? Project name? crimson-club-web
# ? Directory? ./
# ? Override settings? No

# Wait 2 minutes...

# Set environment variables
vercel env add VITE_API_URL production
# Paste: https://crimson-club-api.onrender.com

vercel env add VITE_GOOGLE_CLIENT_ID production
# Paste: YOUR_GOOGLE_CLIENT_ID

# Redeploy with env vars
vercel --prod
```

**Copy your URL:** `https://crimson-club-web.vercel.app`

---

### 5. Final Configuration (2 min)

**Update Backend with Frontend URL:**
```bash
# 1. Go to: https://dashboard.render.com
# 2. Click your "crimson-club-api" service
# 3. Go to "Environment" tab
# 4. Find FRONTEND_URL
# 5. Change to: https://[YOUR-ACTUAL-VERCEL-URL].vercel.app
# 6. Click "Save Changes"
# 7. Wait 2 minutes for redeploy
```

**Update Google OAuth:**
```bash
# 1. Go to: https://console.cloud.google.com/apis/credentials
# 2. Click your OAuth 2.0 Client ID
# 3. Add to "Authorized JavaScript origins":
https://[YOUR-VERCEL-URL].vercel.app

# 4. Add to "Authorized redirect URIs":
https://[YOUR-VERCEL-URL].vercel.app

# 5. Click Save
```

---

## ✅ You're Live!

**Visit your app:** `https://[your-vercel-url].vercel.app`

Test it:
1. Click "Sign in with Google"
2. Authorize the app
3. Create a check-in
4. View analytics

---

## 🎉 What's Next?

### Share Your App
Send your Vercel URL to friends!

### Keep Backend Awake (Optional)
To avoid 30s cold starts:
1. Go to: https://cron-job.org/en/
2. Create account (free)
3. Add new cron job:
   - URL: `https://crimson-club-api.onrender.com/health`
   - Interval: Every 14 minutes
   - This keeps your backend from sleeping

### Monitor Usage
- **Supabase:** https://supabase.com/dashboard (500MB limit)
- **Render:** https://dashboard.render.com (750 hours/month)
- **Vercel:** https://vercel.com/dashboard (100GB bandwidth)

### Custom Domain (Optional)
1. Buy domain (e.g., from Cloudflare, ~$10/year)
2. In Vercel: Settings > Domains > Add
3. Follow DNS instructions
4. Update Google OAuth with new domain

---

## 🆘 Troubleshooting

### "Backend not responding"
- Wait 30-60 seconds (it's waking up from sleep)
- Check Render logs: Dashboard > Your Service > Logs

### "OAuth Error"
- Verify redirect URIs in Google Console match EXACTLY
- Check VITE_GOOGLE_CLIENT_ID is set in Vercel

### "CORS Error"
- Verify FRONTEND_URL in Render matches your Vercel URL
- No trailing slash
- Redeploy backend

### "Can't connect to database"
- Check DATABASE_URL in Render
- Verify Supabase project is active
- Check Render logs for specific error

---

## 💻 CLI Commands Reference

### Deploy Frontend
```bash
cd web
vercel --prod
```

### View Frontend Logs
```bash
vercel logs [deployment-url]
```

### Backend Deploys Automatically
```bash
git add .
git commit -m "Your changes"
git push origin main
# Render auto-deploys
```

### Check Deployment Status
```bash
# Backend: https://dashboard.render.com
# Frontend: vercel ls
```

### Run Database Migrations Manually
```bash
# Set your Supabase URL
export DATABASE_URL="postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres"

cd api
npm run migrate:deploy
```

---

## 📊 Your Deployment Info

Fill this out as you go:

```
GitHub Repo: https://github.com/_____________________
Supabase URL: https://_____________________________.supabase.co
Backend URL:  https://_____________________________.onrender.com
Frontend URL: https://_____________________________.vercel.app

Database Password: ________________________ (keep secret!)
JWT Secret: ________________________ (keep secret!)
```

---

## 🚀 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Database URL saved
- [ ] Backend deployed to Render
- [ ] Environment variables set in Render
- [ ] Backend URL copied
- [ ] Vercel CLI installed
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Frontend URL copied
- [ ] FRONTEND_URL updated in Render
- [ ] Google OAuth URLs updated
- [ ] Tested login
- [ ] Tested check-in
- [ ] Setup cron job (optional)

---

## 📚 More Info

- **Full Deployment Plan:** See `/plans/free-tier-deployment.md`
- **Detailed Guide:** See `/DEPLOYMENT_GUIDE.md`
- **All Options:** See `/plans/deployment-options.md`

---

**💪 You've Got This!**

If you get stuck, check the troubleshooting section above or refer to the detailed guides.

**Time to deploy:** 🚀

