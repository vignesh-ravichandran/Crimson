# 🎯 Google OAuth - Quick Reference Card

## What You Need to Provide to AI Browser Agent

Give your AI browser agent these exact instructions:

---

### URL to Visit
```
https://console.cloud.google.com/
```

---

### Task Summary
```
1. Create new project: "Crimson Club"
2. Setup OAuth consent screen (External)
3. Create OAuth 2.0 Client ID (Web application)
4. Extract and provide Client ID and Client Secret
```

---

### Exact Configuration Values

#### OAuth Consent Screen
| Field | Value |
|-------|-------|
| User Type | External |
| App Name | Crimson Club |
| User Support Email | (your email) |
| Home Page | http://localhost:5173 |
| Privacy Policy | http://localhost:5173 |
| Terms of Service | http://localhost:5173 |
| Developer Contact | (your email) |

**Scopes Required:**
- ✅ `.../auth/userinfo.email`
- ✅ `.../auth/userinfo.profile`
- ✅ `openid`

**Test Users:**
- ✅ (your email address)

---

#### OAuth Client Configuration
| Field | Value |
|-------|-------|
| Application Type | Web application |
| Name | Crimson Club Web Client |

**Authorized JavaScript Origins:**
```
http://localhost:5173
http://localhost:3002
```

**Authorized Redirect URIs:**
```
http://localhost:5173
http://localhost:5173/
http://localhost:3002/api/auth/callback
```

---

## What the AI Should Give You Back

```
Client ID: 123456789-xxxxxxx.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxxxxxxxxxxxx
```

---

## Where to Paste These Values

### File 1: `api/.env`
Replace these lines:
```bash
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET_HERE"
```

With:
```bash
GOOGLE_CLIENT_ID="123456789-xxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxx"
```

### File 2: `web/.env`
Replace this line:
```bash
VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE"
```

With:
```bash
VITE_GOOGLE_CLIENT_ID="123456789-xxxxxxx.apps.googleusercontent.com"
```

*(Use the same Client ID, not the Secret)*

---

## After Updating Files

```bash
# Restart backend (in terminal 1)
cd api && npm run dev

# Restart frontend (in terminal 2)
cd web && npm run dev

# Test at:
http://localhost:5173
```

---

## ✅ Success Checklist

- [ ] AI created Google Cloud project
- [ ] AI configured OAuth consent screen
- [ ] AI added 3 redirect URIs
- [ ] AI provided Client ID and Secret
- [ ] You updated `api/.env`
- [ ] You updated `web/.env`
- [ ] You restarted backend server
- [ ] You restarted frontend server
- [ ] Login page shows Google button
- [ ] Clicking button opens Google popup
- [ ] After signing in, redirects to home page

---

## Common Values AI Might Ask About

| Question | Answer |
|----------|--------|
| Your email? | (provide your email) |
| Project location? | (leave default) |
| Organization? | (leave default or select yours) |
| Enable Google+ API? | Not required for basic OAuth |
| Publishing status? | Testing (default) |
| Support email? | (same as your email) |

---

## Files to Check

1. **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)** - Full detailed guide
2. **[AI_BROWSER_INSTRUCTIONS.txt](AI_BROWSER_INSTRUCTIONS.txt)** - Copy-paste for AI agent
3. **[TEST_STATUS.md](TEST_STATUS.md)** - Testing guide

---

**Estimated Time:** 10 minutes  
**Complexity:** Low (AI agent should handle it easily)

