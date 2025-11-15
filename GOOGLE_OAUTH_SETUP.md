# 🔐 Google OAuth Setup - Complete Guide

## Error You're Seeing
```
Access blocked: Authorization Error
Error 401: invalid_client
The OAuth client was not found.
```

**Reason**: The `GOOGLE_CLIENT_ID` in your `.env` files is either missing or incorrect.

---

## 📋 Complete Setup Instructions

### Step 1: Go to Google Cloud Console
**URL**: https://console.cloud.google.com/

---

### Step 2: Create a New Project (or Select Existing)

**If creating new project:**
- Click "Select a project" dropdown at the top
- Click "NEW PROJECT"
- **Project name**: `Crimson Club`
- **Organization**: (Leave as default or select your org)
- Click "CREATE"
- Wait for project creation (takes ~30 seconds)
- Select the newly created project from the dropdown

---

### Step 3: Configure OAuth Consent Screen

Navigate to: **APIs & Services → OAuth consent screen**

#### Settings to Configure:

**User Type:**
- Select: ☑️ **External**
- Click "CREATE"

**OAuth consent screen (Page 1 - App information):**
- **App name**: `Crimson Club`
- **User support email**: `<your-email@gmail.com>` (your email)
- **App logo**: (Optional - skip for now)
- **Application home page**: `http://localhost:5173`
- **Application privacy policy link**: `http://localhost:5173` (for dev)
- **Application terms of service link**: `http://localhost:5173` (for dev)
- **Authorized domains**: 
  - Leave empty for localhost development
  - (In production, add your domain like `yourdomain.com`)
- **Developer contact information**: `<your-email@gmail.com>` (your email)
- Click "SAVE AND CONTINUE"

**OAuth consent screen (Page 2 - Scopes):**
- Click "ADD OR REMOVE SCOPES"
- Select these scopes:
  - ☑️ `.../auth/userinfo.email` - See your primary Google Account email address
  - ☑️ `.../auth/userinfo.profile` - See your personal info, including any personal info you've made publicly available
  - ☑️ `openid` - Associate you with your personal info on Google
- Click "UPDATE"
- Click "SAVE AND CONTINUE"

**OAuth consent screen (Page 3 - Test users):**
- Click "ADD USERS"
- Enter your email address(es) that you'll use for testing
- Example: `your-email@gmail.com`
- Click "ADD"
- Click "SAVE AND CONTINUE"

**OAuth consent screen (Page 4 - Summary):**
- Review everything
- Click "BACK TO DASHBOARD"

---

### Step 4: Create OAuth 2.0 Credentials

Navigate to: **APIs & Services → Credentials**

**Create Credentials:**
- Click "+ CREATE CREDENTIALS" at the top
- Select: **OAuth client ID**

**Application type:**
- Select: ☑️ **Web application**

**Name:**
- Enter: `Crimson Club Web Client`

**Authorized JavaScript origins:**
- Click "+ ADD URI"
- Add: `http://localhost:5173`
- Click "+ ADD URI" again
- Add: `http://localhost:3002`

**Authorized redirect URIs:**
- Click "+ ADD URI"
- Add: `http://localhost:5173`
- Click "+ ADD URI" again  
- Add: `http://localhost:5173/`
- Click "+ ADD URI" again
- Add: `http://localhost:3002/api/auth/callback`

**Click "CREATE"**

---

### Step 5: Copy Your Credentials

A popup will appear with:
- ✅ **Your Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
- ✅ **Your Client Secret** (looks like: `GOCSPX-abcdefgh123456789`)

**COPY BOTH OF THESE!**

---

### Step 6: Update Your Environment Files

#### Update `api/.env`

Find and replace these lines:
```bash
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET_HERE"
```

With your actual values:
```bash
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefgh123456789"
```

#### Update `web/.env`

Find and replace this line:
```bash
VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE"
```

With your actual Client ID (same as backend):
```bash
VITE_GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
```

---

### Step 7: Restart Your Servers

**Stop both servers** (Ctrl+C in each terminal)

**Restart Backend:**
```bash
cd "/Users/Vignesh_Ravichandran/Documents/Crimson Club/api"
npm run dev
```

**Restart Frontend:**
```bash
cd "/Users/Vignesh_Ravichandran/Documents/Crimson Club/web"
npm run dev
```

---

### Step 8: Test Your Setup

1. Open http://localhost:5173
2. Click "Continue with Google"
3. Select your Google account
4. **You may see a warning**: "Google hasn't verified this app"
   - This is NORMAL for development
   - Click "Advanced" → "Go to Crimson Club (unsafe)"
5. You'll be asked to grant permissions
6. Click "Allow"
7. You should be redirected back to the app and logged in! 🎉

---

## 🤖 Instructions for AI Browser Agent

Here's what to tell an AI browser agent:

```
Go to https://console.cloud.google.com/

1. Create a new project named "Crimson Club"

2. Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" user type
   - App name: "Crimson Club"
   - User support email: <my-email>
   - Developer contact: <my-email>
   - Add scopes: userinfo.email, userinfo.profile, openid
   - Add test user: <my-email>
   - Save and continue through all steps

3. Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Crimson Club Web Client"
   - Authorized JavaScript origins:
     • http://localhost:5173
     • http://localhost:3002
   - Authorized redirect URIs:
     • http://localhost:5173
     • http://localhost:5173/
     • http://localhost:3002/api/auth/callback
   - Click "Create"

4. Copy the Client ID and Client Secret that appear in the popup

5. Give me both values so I can update my .env files
```

---

## 📋 Quick Checklist

Before testing, make sure you have:

- [ ] Created Google Cloud Project
- [ ] Configured OAuth consent screen
- [ ] Added your email as test user
- [ ] Created OAuth 2.0 Client ID
- [ ] Added all 3 authorized redirect URIs
- [ ] Copied Client ID
- [ ] Copied Client Secret
- [ ] Updated `api/.env` with both values
- [ ] Updated `web/.env` with Client ID
- [ ] Restarted backend server
- [ ] Restarted frontend server

---

## 🔍 Troubleshooting

### Error: "The OAuth client was not found"
**Cause**: Client ID is wrong or not updated  
**Fix**: Double-check you copied the full Client ID and updated both `.env` files

### Error: "Redirect URI mismatch"
**Cause**: The redirect URI isn't in the authorized list  
**Fix**: Go back to Google Console → Credentials → Edit your OAuth client  
Add these URIs:
- `http://localhost:5173`
- `http://localhost:5173/`
- `http://localhost:3002/api/auth/callback`

### Warning: "Google hasn't verified this app"
**Cause**: Your app is in testing mode  
**This is NORMAL**: Click "Advanced" → "Go to Crimson Club (unsafe)"  
**For production**: Submit your app for verification (takes 1-2 weeks)

### Error: "Access blocked: This app's request is invalid"
**Cause**: Missing scopes or consent screen not configured  
**Fix**: Go to OAuth consent screen and add the required scopes

---

## 📸 Screenshots Guide

### What OAuth Consent Screen Should Look Like:
```
App information:
├── App name: Crimson Club
├── User support email: your-email@gmail.com
├── App logo: (optional)
└── Developer contact: your-email@gmail.com

Scopes:
├── .../auth/userinfo.email
├── .../auth/userinfo.profile
└── openid

Test users:
└── your-email@gmail.com
```

### What OAuth Client Should Look Like:
```
Client ID for Web application
├── Name: Crimson Club Web Client
├── Client ID: 123456789-abcdefg.apps.googleusercontent.com
├── Client Secret: GOCSPX-abcdefgh123456789
│
├── Authorized JavaScript origins:
│   ├── http://localhost:5173
│   └── http://localhost:3002
│
└── Authorized redirect URIs:
    ├── http://localhost:5173
    ├── http://localhost:5173/
    └── http://localhost:3002/api/auth/callback
```

---

## 🎯 After Setup - What You Should See

1. **Login page** at http://localhost:5173
2. **"Continue with Google" button** - clickable
3. **Google sign-in popup** - opens
4. **Account selection** - shows your Google accounts
5. **Permissions screen** - asks for email/profile access
6. **Home page** - after allowing, shows your dashboard
7. **Your profile info** - displayed at bottom of home page

---

## 🚀 Production Setup (Later)

For production deployment, you'll need to:

1. **Update authorized origins**:
   - Add `https://yourdomain.com`
   - Remove `localhost` URLs

2. **Update redirect URIs**:
   - Add `https://yourdomain.com`
   - Add `https://yourdomain.com/`
   - Remove `localhost` URLs

3. **Verify your app**:
   - Submit to Google for verification
   - Provide privacy policy and terms of service
   - Complete security assessment

4. **Update environment variables**:
   - Use production Client ID and Secret
   - Update `VITE_API_URL` to production URL
   - Update `CORS_ORIGIN` in backend

---

## 📞 Need Help?

If you're still stuck:
1. Check browser console for errors (F12 → Console)
2. Check backend terminal for errors
3. Verify all URLs are exactly as shown (no typos)
4. Make sure you restarted both servers after updating .env

---

**Good luck! Once you have the Client ID and Secret, it should work immediately!** 🎉

