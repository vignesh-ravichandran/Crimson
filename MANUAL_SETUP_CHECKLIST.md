# ✋ MANUAL SETUP CHECKLIST - What YOU Need to Do

**Goal:** Gather credentials and create accounts. Then I'll deploy everything via CLI.

---

## 🎯 Quick Overview

You need to:
1. Create 3 free accounts (5 minutes)
2. Get 5 pieces of information
3. Give me those details
4. I'll deploy everything via CLI ✨

---

## ✅ STEP 1: GitHub Repository (5 minutes)

### What to Do:
1. Go to: https://github.com/new
2. Fill in:
   - Repository name: `crimson-club` (or whatever you want)
   - Description: `Habit tracking app` (optional)
   - **Make it Private or Public** (your choice)
   - **DO NOT** check "Initialize with README"
3. Click "Create repository"

### What to Give Me:
```
GitHub Repository URL: https://github.com/YOUR_USERNAME/crimson-club
```

**Note:** I'll push the code to GitHub via CLI for you.

---

## ✅ STEP 2: Supabase Account & Database (5 minutes)

### What to Do:

**A. Create Account:**
1. Go to: https://supabase.com/dashboard/sign-up
2. Sign up (use GitHub - easiest)
3. No credit card required ✅

**B. Create Project:**
1. After login, click "New Project"
2. Fill in:
   - **Name:** `crimson-club`
   - **Database Password:** Click "Generate a password" (VERY IMPORTANT: SAVE THIS!)
   - **Region:** Choose closest to your users (e.g., `US East (North Virginia)`)
   - **Pricing Plan:** Free (already selected)
3. Click "Create new project"
4. **Wait 2 minutes** while project initializes ⏳

**C. Get Connection String:**
1. Once project is ready, go to: **Settings** (left sidebar)
2. Click **Database**
3. Scroll to "**Connection string**" section
4. Select "**URI**" tab
5. Copy the connection string
6. **IMPORTANT:** Replace `[YOUR-PASSWORD]` with the actual password you saved in step B2

### What to Give Me:
```
Database URL (with real password): 
postgresql://postgres:YOUR_ACTUAL_PASSWORD_HERE@db.xxxxxxxxxxxxxx.supabase.co:5432/postgres
```

**Example:**
```
postgresql://postgres:MySecurePassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

---

## ✅ STEP 3: Render Account (2 minutes)

### What to Do:

1. Go to: https://dashboard.render.com/register
2. Click "**Sign up with GitHub**" (easiest option)
3. Authorize Render to access your GitHub
4. That's it! Account created ✅

### What to Give Me:
```
✅ Render account created with GitHub
```

**Note:** I'll create the backend service via Render's API/CLI or you can connect it manually (I'll guide you).

---

## ✅ STEP 4: Vercel Account (2 minutes)

### What to Do:

1. Go to: https://vercel.com/signup
2. Click "**Continue with GitHub**" (recommended)
3. Authorize Vercel
4. That's it! Account created ✅

### What to Give Me:
```
✅ Vercel account created with GitHub
```

**Note:** I'll deploy via CLI for you.

---

## ✅ STEP 5: Google OAuth Credentials (10 minutes)

### What to Do:

**A. Go to Google Cloud Console:**
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

**B. Create Project (if you don't have one):**
1. Click project dropdown at top (says "Select a project")
2. Click "**NEW PROJECT**"
3. Name: `Crimson Club`
4. Click "**Create**"
5. Wait ~30 seconds for project creation

**C. Enable Google+ API:**
1. Make sure your new project is selected (top dropdown)
2. Go to: https://console.cloud.google.com/apis/library
3. Search for "**Google+ API**"
4. Click on it
5. Click "**ENABLE**"

**D. Configure OAuth Consent Screen:**
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Select "**External**" (unless you have Google Workspace)
3. Click "**CREATE**"
4. Fill in:
   - **App name:** `Crimson Club`
   - **User support email:** Your email
   - **Developer contact:** Your email
   - Leave everything else default
5. Click "**SAVE AND CONTINUE**"
6. **Scopes page:** Click "**SAVE AND CONTINUE**" (skip this)
7. **Test users page:** Click "**SAVE AND CONTINUE**" (skip this)
8. Click "**BACK TO DASHBOARD**"

**E. Create OAuth Client ID:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "**+ CREATE CREDENTIALS**" at top
3. Select "**OAuth client ID**"
4. Fill in:
   - **Application type:** Web application
   - **Name:** `Crimson Club Web`
   - **Authorized JavaScript origins:**
     - Click "+ ADD URI"
     - Add: `http://localhost:5173` (for local development)
     - Click "+ ADD URI" again
     - Add: `https://localhost:5173` (optional, for local HTTPS)
   - **Authorized redirect URIs:**
     - Click "+ ADD URI"  
     - Add: `http://localhost:5173` (for local development)
   
   **Note:** We'll add production URLs after deployment
   
5. Click "**CREATE**"
6. A popup shows your credentials

**F. Copy Your Client ID:**
1. In the popup, copy the "**Client ID**" (long string ending in `.apps.googleusercontent.com`)
2. You can ignore "Client Secret" for now
3. Click "OK"

### What to Give Me:
```
Google Client ID: 
123456789012-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

---

## 📋 COMPLETE INFORMATION CHECKLIST

Once you've done all the above, give me these 3 things:

```
1. GitHub Repository URL:
   https://github.com/YOUR_USERNAME/crimson-club

2. Supabase Database URL (with your real password):
   postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxxxx.supabase.co:5432/postgres

3. Google OAuth Client ID:
   123456789012-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com

✅ Render account created (linked to GitHub)
✅ Vercel account created (linked to GitHub)
```

---

## 🎯 What I'll Do After You Give Me This

Once you provide the above information, I will:

### ✅ Via CLI (Automated):
1. ✅ Generate secure JWT secret
2. ✅ Push code to your GitHub repository
3. ✅ Deploy frontend to Vercel
4. ✅ Set all Vercel environment variables
5. ✅ Run database migrations to Supabase
6. ✅ Verify database connection
7. ✅ Get your live frontend URL
8. ✅ Get your live backend URL

### ⚠️ Manual (Needs Browser - I'll Guide):
Unfortunately, these CANNOT be done via CLI and you'll need to help:

1. **Connect Render to GitHub** (2 minutes)
   - I'll give you exact clicks: Dashboard → New Web Service → Select Repo
   
2. **Set Render Environment Variables** (3 minutes)
   - I'll give you the exact key-value pairs to paste
   
3. **Update Google OAuth URLs** (1 minute)
   - After deployment, add production URLs to Google Console
   - I'll give you the exact URLs to add

**Estimate:** 6 minutes of browser clicking after I deploy via CLI

---

## 🚫 What You DON'T Need to Do

I'll handle these via CLI:
- ❌ Don't manually deploy to Vercel (I'll use CLI)
- ❌ Don't manually run database migrations (I'll use CLI)
- ❌ Don't create any config files (already done)
- ❌ Don't install dependencies (I'll do it)
- ❌ Don't build the app (I'll do it)

---

## ⏱️ Time Estimate

| Task | Time |
|------|------|
| GitHub repo creation | 2 min |
| Supabase account + DB | 5 min |
| Render account | 2 min |
| Vercel account | 2 min |
| Google OAuth setup | 10 min |
| **Total YOUR time:** | **~20 min** |
| **Total MY time (CLI):** | **~5 min** |
| **Browser setup after:** | **~6 min** |

---

## 🔐 Security Notes

**Keep these SECRET:**
- ✅ Database URL with password
- ✅ Google Client ID is OK to share with me
- ✅ Don't share these in public places
- ✅ I'm in your local environment, so it's safe

---

## ✅ Ready to Start?

1. **Do steps 1-5 above** (collect information)
2. **Give me the 3 pieces of information** in this format:

```
GITHUB_REPO=https://github.com/YOUR_USERNAME/crimson-club
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
GOOGLE_CLIENT_ID=123456789012-xxxxxxxx.apps.googleusercontent.com
```

3. **I'll deploy everything via CLI** ✨
4. **You do 6 minutes of browser clicks** (I'll guide you step-by-step)
5. **Done!** 🎉

---

## 🆘 Common Issues

### "I can't find the Supabase connection string"
- Go to: Settings → Database → Connection string → URI tab

### "GitHub repo creation asks for payment"
- It shouldn't. Make sure you're creating a regular repo, not an organization

### "Google OAuth consent screen is confusing"
- Just fill in app name and your email. Skip everything else.

### "I don't have a Google Cloud Project"
- That's fine! Follow step 5B to create one (30 seconds)

---

## 📞 Help Resources

- **Supabase Setup:** https://supabase.com/docs/guides/getting-started
- **Google OAuth:** See GOOGLE_OAUTH_SETUP.md in this repo
- **Render:** https://render.com/docs/deploy-node-express-app
- **Vercel:** https://vercel.com/docs/getting-started-with-vercel

---

## ✨ Once You're Done

Post the information in this format:

```markdown
**READY FOR DEPLOYMENT**

GITHUB_REPO=https://github.com/yourusername/crimson-club
DATABASE_URL=postgresql://postgres:your_password@db.xxxxx.supabase.co:5432/postgres
GOOGLE_CLIENT_ID=123456789012-xxxxxxxx.apps.googleusercontent.com

✅ Render account created (GitHub connected)
✅ Vercel account created (GitHub connected)
```

Then I'll take over! 🚀

---

**Current Status:** ⏸️ Waiting for you to complete the manual setup above

_Once you give me the information, deployment via CLI will take ~5 minutes!_

