# 🏗️ Crimson Club - Deployment Architecture

**Cost:** $0/month (FREE Tier)  
**Deployment Method:** CLI + Git-based  
**Total Setup Time:** 20 minutes

---

## 🌐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Google OAuth    │
                    │  Authentication  │
                    └──────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────────┐                    ┌──────────────────┐
│   VERCEL (FREE)   │                    │  Users Browser   │
│                   │                    │                  │
│  React + Vite     │◄───────────────────│  React App       │
│  Static Hosting   │                    │  PWA Features    │
│                   │                    │                  │
│  • Automatic HTTPS│                    └──────────────────┘
│  • Global CDN     │
│  • 100GB Bandwidth│
└────────┬──────────┘
         │
         │ API Calls
         │ (CORS Protected)
         ▼
┌─────────────────────┐
│  RENDER (FREE)      │
│                     │
│  Node.js + Express  │
│  Backend API        │
│                     │
│  • Auto-sleep 15min │
│  • 750 hrs/month    │
│  • Auto-deploy      │
└────────┬────────────┘
         │
         │ Database
         │ Connection
         │ (PostgreSQL)
         ▼
┌─────────────────────┐
│  SUPABASE (FREE)    │
│                     │
│  PostgreSQL DB      │
│                     │
│  • 500MB Storage    │
│  • 2GB Bandwidth    │
│  • Automatic Backups│
└─────────────────────┘
```

---

## 📦 Component Details

### Frontend (Vercel)
```
URL:       https://crimson-club-web.vercel.app
Type:      Static Site (React SPA)
Build:     Vite
Deploy:    vercel --prod
Config:    /web/vercel.json
Env Vars:  
  - VITE_API_URL
  - VITE_GOOGLE_CLIENT_ID
```

**Features:**
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Instant deploys (~2 min)
- ✅ Preview deployments
- ✅ PWA capabilities

### Backend (Render)
```
URL:       https://crimson-club-api.onrender.com
Type:      Web Service (Node.js)
Runtime:   Node 18+
Deploy:    Git push (automatic)
Config:    /render.yaml
Env Vars:
  - NODE_ENV=production
  - PORT=10000
  - DATABASE_URL
  - JWT_SECRET
  - GOOGLE_CLIENT_ID
  - FRONTEND_URL
```

**Features:**
- ✅ Auto-deploy on push
- ✅ Health monitoring
- ✅ Log streaming
- ⚠️  Sleeps after 15min (cold start ~30s)

### Database (Supabase)
```
URL:       postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
Type:      PostgreSQL 15
Size:      500MB (free tier)
Location:  US East (configurable)
```

**Features:**
- ✅ Automatic backups
- ✅ SSL connections
- ✅ Web-based SQL editor
- ✅ Real-time dashboard

---

## 🔄 Deployment Flow

### Initial Deployment

```
┌──────────────┐
│ Developer    │
│ (Your PC)    │
└──────┬───────┘
       │
       │ git push
       ▼
┌──────────────┐
│   GitHub     │
│ (Your Repo)  │
└──────┬───────┘
       │
       ├─────────────────────────┐
       │                         │
       │ Webhook                 │ Webhook
       ▼                         ▼
┌──────────────┐         ┌──────────────┐
│    Render    │         │   Vercel     │
│              │         │              │
│ 1. npm build │         │ 1. npm build │
│ 2. Generate  │         │ 2. Optimize  │
│    Prisma    │         │ 3. Deploy    │
│ 3. Migrate   │         │    to CDN    │
│ 4. Start API │         └──────────────┘
└──────┬───────┘
       │
       │ Connect
       ▼
┌──────────────┐
│   Supabase   │
│  PostgreSQL  │
└──────────────┘
```

### Continuous Deployment

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Render auto-deploys backend (5 min)
# Vercel auto-deploys frontend (2 min) if web/ changed
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────┐
│            Security Layers                   │
├─────────────────────────────────────────────┤
│                                              │
│  1. HTTPS Everywhere (TLS 1.3)              │
│     └─ Automatic on Vercel & Render         │
│                                              │
│  2. CORS Protection                          │
│     └─ Only allows requests from            │
│        configured frontend URL              │
│                                              │
│  3. JWT Authentication                       │
│     └─ Secure token-based auth              │
│     └─ Google OAuth integration             │
│                                              │
│  4. Rate Limiting                            │
│     └─ 1000 requests/hour per IP            │
│                                              │
│  5. Security Headers                         │
│     └─ X-Frame-Options: DENY                │
│     └─ X-Content-Type-Options: nosniff      │
│     └─ Referrer-Policy                      │
│                                              │
│  6. Environment Variables                    │
│     └─ Secrets never in code                │
│     └─ Platform-managed encryption          │
│                                              │
│  7. Database Security                        │
│     └─ SSL-only connections                 │
│     └─ Supabase managed security            │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 📊 Traffic Flow

### User Login Flow
```
1. User visits https://your-app.vercel.app
   └─> Vercel serves React app from CDN

2. User clicks "Login with Google"
   └─> Google OAuth popup opens

3. User authorizes app
   └─> Google redirects back with auth code

4. Frontend sends code to backend
   └─> POST https://your-api.onrender.com/api/auth/google

5. Backend validates with Google
   └─> Generates JWT token
   └─> Queries/creates user in Supabase

6. Frontend receives JWT
   └─> Stores in localStorage
   └─> Redirects to home page
```

### Check-in Creation Flow
```
1. User submits check-in form
   └─> Frontend validates data

2. API call with JWT token
   └─> POST https://your-api.onrender.com/api/checkins
   └─> Authorization: Bearer <token>

3. Backend authenticates request
   └─> Validates JWT token
   └─> Extracts user ID

4. Backend saves to database
   └─> Prisma ORM query
   └─> INSERT into Supabase PostgreSQL

5. Backend responds with created check-in
   └─> Frontend updates UI
   └─> Shows success animation
```

---

## 🔍 Monitoring & Debugging

### Backend Logs
```bash
# View in Render Dashboard
https://dashboard.render.com
└─> Select service
    └─> Logs tab
        └─> Real-time streaming
```

### Frontend Logs
```bash
# CLI
vercel logs [deployment-url]

# Dashboard
https://vercel.com/dashboard
└─> Select project
    └─> Deployments
        └─> Select deployment
            └─> Build logs & Runtime logs
```

### Database Monitoring
```bash
# Supabase Dashboard
https://supabase.com/dashboard
└─> Select project
    └─> Database
        └─> Usage (storage, bandwidth)
        └─> Logs
        └─> SQL Editor
```

### Health Checks
```bash
# Backend health (simple)
curl https://your-api.onrender.com/health

# Backend health (detailed with DB check)
curl https://your-api.onrender.com/api/health

# Frontend
curl https://your-app.vercel.app
```

---

## 💰 Cost Breakdown

### Current Setup (FREE)
```
Vercel:    $0/month
Render:    $0/month
Supabase:  $0/month
Domain:    $0 (using *.vercel.app subdomain)
─────────────────────
TOTAL:     $0/month 🎉
```

### Free Tier Limits
```
Vercel:
├─ 100GB bandwidth/month
├─ Unlimited deployments
└─ Unlimited projects

Render:
├─ 750 hours/month runtime
├─ 512MB RAM
├─ Sleeps after 15min inactivity
└─ 1 concurrent build

Supabase:
├─ 500MB database storage
├─ 2GB bandwidth/month
├─ 50,000 monthly active users
└─ 7 days log retention
```

### Upgrade Paths (If Needed Later)
```
Eliminate Backend Cold Starts:
└─> Render Starter: $7/month

More Database Storage:
└─> Supabase Pro: $25/month (8GB storage)

More Frontend Bandwidth:
└─> Vercel Pro: $20/month (1TB bandwidth)

Custom Domain:
└─> Cloudflare Registrar: ~$10/year
```

---

## 🚀 Scalability Path

### Phase 1: MVP (Current) - FREE
- Good for: 0-1,000 users
- Traffic: <100,000 requests/month
- Storage: <500MB data

### Phase 2: Growth - $7/month
- Upgrade: Render Starter (no cold starts)
- Good for: 1,000-10,000 users
- Traffic: <1M requests/month

### Phase 3: Scale - $32/month
- Upgrade: Render Starter + Supabase Pro
- Good for: 10,000-100,000 users
- Storage: Up to 8GB data

### Phase 4: Production - $100+/month
- Move to: Railway, Fly.io, or AWS
- Features: Auto-scaling, load balancing
- Good for: 100,000+ users

---

## 📁 File Structure

```
crimson-club/
│
├── 🎯 Deployment Configs
│   ├── render.yaml                 # Backend deployment
│   ├── web/vercel.json            # Frontend deployment
│   ├── api/env.production.example # Backend env template
│   └── web/env.production.example # Frontend env template
│
├── 📚 Documentation
│   ├── DEPLOY_NOW.md              # Quick start (20 min)
│   ├── DEPLOYMENT_GUIDE.md        # Detailed guide
│   ├── DEPLOYMENT_ARCHITECTURE.md # This file
│   └── plans/
│       ├── deployment-options.md
│       ├── free-tier-deployment.md
│       └── deployment-setup-complete.md
│
├── 🔧 Scripts
│   ├── deploy-vercel.sh           # Frontend deploy
│   ├── setup-database.sh          # DB initialization
│   └── verify-deployment.sh       # Post-deploy checks
│
├── 🌐 Frontend (web/)
│   ├── src/                       # React application
│   ├── dist/                      # Build output (Vercel serves this)
│   └── vercel.json               # Deployment config
│
└── ⚙️  Backend (api/)
    ├── src/                       # Express API
    ├── prisma/                    # Database schema & migrations
    └── dist/                      # Build output (Render runs this)
```

---

## ✅ Deployment Readiness Checklist

### Pre-Deployment
- [x] Configuration files created
- [x] CORS configured for production
- [x] Health endpoints added
- [x] Environment variable templates ready
- [x] Deployment scripts created
- [x] Documentation complete

### User Actions Required
- [ ] Push code to GitHub
- [ ] Create Supabase account & project
- [ ] Create Render account & service
- [ ] Install Vercel CLI
- [ ] Deploy frontend to Vercel
- [ ] Set all environment variables
- [ ] Update Google OAuth redirect URLs
- [ ] Test end-to-end

---

## 🎓 Key Advantages of This Setup

1. **Zero Cost** - Perfect for MVPs and demos
2. **CLI Deployment** - No manual builds or uploads
3. **Auto-Deploy** - Git push = deployed
4. **Production Ready** - HTTPS, CORS, rate limiting, security headers
5. **Scalable** - Easy to upgrade individual components
6. **Separate Concerns** - Frontend, backend, database independently managed
7. **Developer Friendly** - Great logging, easy rollbacks
8. **No DevOps Required** - Platforms handle servers, scaling, SSL

---

## 📞 Quick Reference URLs

```
Documentation:
└─> Quick Start:  /DEPLOY_NOW.md
└─> Full Guide:   /DEPLOYMENT_GUIDE.md
└─> All Options:  /plans/deployment-options.md

Platform Dashboards:
└─> Vercel:       https://vercel.com/dashboard
└─> Render:       https://dashboard.render.com
└─> Supabase:     https://supabase.com/dashboard

Platform Docs:
└─> Vercel:       https://vercel.com/docs
└─> Render:       https://render.com/docs
└─> Supabase:     https://supabase.com/docs
```

---

**Ready to deploy?** Start with: `/DEPLOY_NOW.md` 🚀

_Architecture designed for: Cost-effectiveness, Easy CLI deployment, Production readiness_

