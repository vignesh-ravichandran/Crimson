# 🚀 Getting Started with Crimson Club

Welcome! This guide will help you get the application running locally in **under 15 minutes**.

---

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 13+ ([Download](https://www.postgresql.org/download/))
- **Google OAuth Credentials** (see below)
- **Git** (optional, for version control)

---

## ⚡ Quick Start (5 Steps)

### Step 1: Set Up PostgreSQL Database

**Option A: Using Docker (Recommended)**
```bash
docker run --name crimson-db \
  -e POSTGRES_USER=crimson \
  -e POSTGRES_PASSWORD=crimson \
  -e POSTGRES_DB=crimson_club \
  -p 5432:5432 \
  -d postgres:15
```

**Option B: Local PostgreSQL**
```bash
# On macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15
createdb crimson_club

# On Ubuntu/Debian
sudo apt-get install postgresql
sudo -u postgres createdb crimson_club
```

---

### Step 2: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth Client ID**
5. Application type: **Web application**
6. Add Authorized redirect URI: `http://localhost:5173`
7. Copy **Client ID** and **Client Secret**

---

### Step 3: Set Up Backend

```bash
cd api

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://crimson:crimson@localhost:5432/crimson_club"
JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
GOOGLE_CLIENT_ID="paste_your_google_client_id_here"
GOOGLE_CLIENT_SECRET="paste_your_google_client_secret_here"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
EOF

# Run database migrations
npm run migrate

# (Optional) Seed initial data
npm run seed

# Start backend server
npm run dev
```

✅ Backend should now be running at `http://localhost:3000`

---

### Step 4: Set Up Frontend

Open a new terminal:

```bash
cd web

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_GOOGLE_CLIENT_ID="paste_your_google_client_id_here"
VITE_API_URL="http://localhost:3000/api"
EOF

# Start frontend server
npm run dev
```

✅ Frontend should now be running at `http://localhost:5173`

---

### Step 5: Verify Setup

1. **Backend Health Check**:
   Open http://localhost:3000/api/health
   
   Should see:
   ```json
   {
     "status": "ok",
     "version": "1.0.0",
     "services": {
       "database": "healthy"
     }
   }
   ```

2. **Frontend**:
   Open http://localhost:5173
   
   Should see: **Crimson Club** welcome page

3. **Database**:
   ```bash
   cd api
   npm run studio
   ```
   Opens Prisma Studio at http://localhost:5555

---

## 🎯 What's Next?

### Immediate Next Steps

Now that the foundation is running, here's what to build next:

#### 1. Complete Authentication (Frontend)
- **File**: `web/src/features/auth/components/GoogleLoginButton.tsx`
- **Reference**: `design/authentication.md`
- **Goal**: Enable Google sign-in

#### 2. Create Journey Module (Backend)
- **Files**: `api/src/modules/journeys/*`
- **Reference**: `design/api-specification.md` Section 2
- **Goal**: CRUD operations for journeys

#### 3. Create Check-in Module (Backend)
- **Files**: `api/src/modules/checkins/*`
- **Reference**: `design/api-specification.md` Section 3
- **Goal**: Daily check-in submission

---

## 📚 Project Structure Overview

```
Crimson Club/
├── api/              # Backend (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── modules/  # Feature modules
│   │   ├── middleware/
│   │   ├── lib/
│   │   └── main.ts
│   └── prisma/
│
├── web/              # Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── components/
│   │   └── styles/
│   └── public/
│
└── design/           # Technical specifications
```

---

## 🔧 Development Workflow

### Running Both Servers

```bash
# Terminal 1 - Backend
cd api && npm run dev

# Terminal 2 - Frontend
cd web && npm run dev

# Terminal 3 - Database GUI (optional)
cd api && npm run studio
```

### Common Commands

#### Backend
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run migrate          # Run database migrations
npm run migrate:reset    # Reset database (⚠️ deletes all data)
npm run seed             # Seed initial data
npm run studio           # Open Prisma Studio
npm test                 # Run tests
```

#### Frontend
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm test                 # Run tests
npm run lint             # Lint code
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error**: `Database connection failed`
```bash
# Check if PostgreSQL is running
pg_isready

# Verify DATABASE_URL in api/.env
# Test connection
psql postgresql://crimson:crimson@localhost:5432/crimson_club
```

**Error**: `Port 3000 already in use`
```bash
# Change port in api/.env
PORT=3001

# Update VITE_API_URL in web/.env
VITE_API_URL="http://localhost:3001/api"
```

### Frontend Won't Start

**Error**: `Failed to fetch`
- Ensure backend is running on http://localhost:3000
- Check VITE_API_URL in web/.env

**Error**: `Module not found`
```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

### Database Issues

**Reset everything**:
```bash
cd api
npm run migrate:reset  # ⚠️ Deletes all data
npm run migrate
npm run seed
```

**Check database tables**:
```bash
cd api
npm run studio
# Browse tables in GUI at localhost:5555
```

---

## 📖 Documentation

### Essential Reading

1. **[Design.md](Design.md)** - High-level architecture overview
2. **[IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md)** - Current status and next steps
3. **[api/README.md](api/README.md)** - Backend documentation
4. **[design/README.md](design/README.md)** - Navigate all design specs

### Detailed Specifications

All in the `design/` folder:
- **database-schema.md** - Complete DB schema with examples
- **api-specification.md** - All API endpoints
- **authentication.md** - OAuth + JWT implementation
- **gamification-engine.md** - Badges and streaks
- **charts-analytics.md** - All 6 chart types
- **offline-pwa.md** - PWA and offline functionality
- **frontend-components.md** - UI components and design tokens
- **timezone-handling.md** - Simple timezone strategy

---

## 🧪 Testing

### Test Backend Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# After implementing auth, test login
curl -X POST http://localhost:3000/api/auth/oauth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "google_id_token_here"}'
```

### Run Tests

```bash
# Backend
cd api
npm test

# Frontend
cd web
npm test
```

---

## 🎨 Design System

### Colors (Tailwind Classes)

**Light Mode**:
- Primary: `bg-primary-500` (#DC143C)
- Accent: `bg-accent-800` (#8B0000)
- Background: `bg-background` (#FFFFFF)
- Surface: `bg-surface` (#F7F7F8)

**Dark Mode**:
- Add `dark:` prefix to any class
- Example: `dark:bg-background` (#000000)

### Components

Pre-built CSS classes in `web/src/styles/index.css`:
- `.btn-primary`
- `.btn-secondary`
- `.btn-ghost`

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ chars)
- [ ] Configure production `DATABASE_URL`
- [ ] Set proper `CORS_ORIGIN`
- [ ] Run `npm run migrate:deploy`
- [ ] Set up SSL/HTTPS
- [ ] Configure database backups
- [ ] Set up monitoring (Sentry, etc.)

### Build for Production

```bash
# Backend
cd api
npm run build
npm start

# Frontend
cd web
npm run build
npm run preview
```

---

## 💡 Pro Tips

1. **Use Prisma Studio** - Visual database browser is incredibly helpful
   ```bash
   cd api && npm run studio
   ```

2. **Hot Reload** - Both servers auto-reload on file changes

3. **Console Logs** - Backend logs show all SQL queries in development

4. **Design Docs** - They have copy-pasteable code examples

5. **Type Safety** - TypeScript catches bugs before runtime

---

## 🆘 Get Help

### Resources
- [Design Documentation](design/README.md)
- [Backend README](api/README.md)
- [Implementation Progress](IMPLEMENTATION_PROGRESS.md)

### Common Issues
- Database connection → Check PostgreSQL is running
- OAuth errors → Verify Google credentials
- Port conflicts → Change PORT in .env
- Module errors → Delete node_modules and reinstall

---

## 📋 Verification Checklist

Before proceeding with development, verify:

- [ ] Backend runs at `http://localhost:3000`
- [ ] Frontend runs at `http://localhost:5173`
- [ ] Health endpoint returns `{"status": "ok"}`
- [ ] Prisma Studio opens and shows tables
- [ ] Frontend welcome page displays
- [ ] No errors in console (backend or frontend)

---

## 🎉 You're Ready!

Foundation is complete. Time to build features! 🚀

**Next recommended task**: Implement the Journeys module (backend) following `design/api-specification.md` Section 2.

Good luck building Crimson Club!

