# Crimson Club — Technical Design Overview

This is the main technical design document for Crimson Club. It provides a high-level overview and references detailed design specifications organized in the `design/` folder.

---

## 📚 Document Organization

This design is split into focused documents for easier navigation:

| Document | Description |
|----------|-------------|
| **[database-schema.md](design/database-schema.md)** | Complete PostgreSQL schema with tables, indexes, triggers, and queries |
| **[api-specification.md](design/api-specification.md)** | All REST API endpoints with request/response examples |
| **[authentication.md](design/authentication.md)** | Google OAuth flow and JWT implementation |
| **[gamification-engine.md](design/gamification-engine.md)** | Badges, streaks, and micro-celebrations |
| **[charts-analytics.md](design/charts-analytics.md)** | All 6 chart types with data structures and components |
| **[offline-pwa.md](design/offline-pwa.md)** | PWA manifest, service worker, and offline check-in strategy |
| **[frontend-components.md](design/frontend-components.md)** | Design tokens, UI components, and theme system |
| **[timezone-handling.md](design/timezone-handling.md)** | Simple timezone strategy (FE local, BE UTC) |

---

## 🎯 Product Overview

**Crimson Club** is a mobile-first habit and progress tracking web app. Users join "Journeys" (goal-tracking containers) and perform daily check-ins across multiple dimensions (skills/behaviors). The app visualizes progress through charts, leaderboards, and gamification (streaks and badges).

**Key Features**:
- Multi-dimensional daily check-ins with swipe UI
- 6 chart types for analytics (radar, stacked bar, line, heatmap, trends, comparison)
- Streak tracking and badge system
- Public and private journeys
- Leaderboards with multiple sort options
- Offline-first PWA with background sync
- Google OAuth authentication

---

## 🏗️ Architecture Overview

### High-Level Stack

```
┌─────────────────────────────────────┐
│         React PWA Frontend          │
│    (Vite + React + Tailwind CSS)    │
│    Service Worker + IndexedDB       │
└──────────────┬──────────────────────┘
               │ REST JSON API
               │ (JWT Bearer Auth)
┌──────────────┴──────────────────────┐
│       Node.js + Express Backend     │
│      (TypeScript + Prisma ORM)      │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│       PostgreSQL Database           │
│      (13+, UUID keys, JSONB)        │
└─────────────────────────────────────┘
```

### Technology Choices

**Frontend**:
- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Recharts for charts
- Workbox for PWA/offline
- localforage for IndexedDB

**Backend**:
- Node.js 18+ with TypeScript
- Express (REST API)
- Prisma (ORM and migrations)
- JWT for auth
- Google OAuth 2.0

**Database**:
- PostgreSQL 13+
- UUID primary keys
- Timestamptz (UTC) for all timestamps
- JSONB for flexible fields

**Infrastructure**:
- Docker containers
- Managed PostgreSQL
- No Redis caching for MVP
- No push notifications for MVP
- No API versioning for MVP

---

## 🗄️ Database Design

See **[database-schema.md](design/database-schema.md)** for full details.

### Core Tables

1. **users** - User accounts (OAuth + JWT)
2. **journeys** - Goal-tracking containers
3. **journey_members** - User participation in journeys
4. **dimensions** - Tracking dimensions within journeys (weighted 1-5)
5. **checkins** - Daily check-in records per user per journey
6. **checkin_details** - Individual dimension efforts and scores
7. **badges** - System-defined badge definitions
8. **user_badges** - Earned badges per user
9. **streaks** - Current and longest streaks per user per journey
10. **journey_invites** - Invite tokens for private journeys
11. **leaderboard_cache** - Pre-aggregated leaderboard data

### Key Design Decisions

- **UUID Keys**: Better for distributed systems and security
- **Timestamptz**: All timestamps in UTC, converted at app layer
- **DATE Type**: Check-in dates stored as DATE (no timezone issues)
- **JSONB**: Used for settings, examples, badge metadata
- **Cascading Deletes**: User/journey deletion cascades appropriately
- **Triggers**: Auto-update `updated_at` and recalculate scores

---

## 🔐 Authentication & Authorization

See **[authentication.md](design/authentication.md)** for full implementation.

### Flow

1. User clicks "Sign in with Google"
2. Google OAuth consent screen
3. Frontend receives Google token
4. Backend verifies token with Google
5. Backend creates/updates user
6. Backend returns JWT (7-day expiry)
7. Frontend stores JWT in localStorage
8. All API calls include `Authorization: Bearer <JWT>`

### Security

- JWT signed with strong secret (32+ chars)
- Tokens expire after 7 days
- No refresh tokens for MVP
- HTTPS required in production
- CORS configured for app domain only

---

## 📊 API Design

See **[api-specification.md](design/api-specification.md)** for complete endpoints.

### Base Structure

- **Base URL**: `/api/` (no versioning for MVP)
- **Format**: JSON only
- **Auth**: JWT Bearer tokens
- **Response Envelope**: `{ data, meta }` or `{ error, meta }`

### Main Endpoint Groups

1. **Auth**: `/api/auth/oauth/google`
2. **Users**: `/api/users/me`
3. **Journeys**: `/api/journeys` (CRUD + join/invite)
4. **Check-ins**: `/api/checkins`
5. **Analytics**: `/api/journeys/:id/analytics/*` (6 chart endpoints)
6. **Leaderboard**: `/api/journeys/:id/leaderboard`
7. **Gamification**: `/api/users/:id/badges`, `/api/users/:id/streaks`

### Consistency

- Standard HTTP methods (GET, POST, PUT, DELETE)
- Standard status codes (200, 201, 400, 401, 403, 404, 409, 500)
- Pagination for list endpoints
- Idempotency via `clientCheckinId`

---

## 🎮 Gamification Engine

See **[gamification-engine.md](design/gamification-engine.md)** for full specification.

### Streaks

- **Definition**: Consecutive days with check-ins
- **Calculation**: Automatic on check-in submission
- **Display**: Current streak, longest streak, streak badges

### Badges

**Types**:
1. **Streak Badges**: 3, 7, 14, 30, 100-day streaks
2. **Performance Badges**: Beast Mode (3+ "Crushed It" in week), Perfect Week
3. **Milestone Badges**: First check-in, journey creator, climber (20% improvement)

**Evaluation**:
- Real-time: Simple badges on check-in submission
- Nightly job: Complex badges (perfect week, improvement)

### Micro-Celebrations

- **Confetti**: canvas-confetti library (on "Crushed It" or badge earned)
- **Haptic**: Web Vibration API (light/medium/heavy patterns)
- **Sound**: Optional audio feedback (respects user settings)
- **Modal**: Badge award modal with emoji and description

---

## 📈 Charts & Analytics

See **[charts-analytics.md](design/charts-analytics.md)** for full specifications.

### 6 Chart Types

1. **Radar Graph**: Multi-dimension strengths (avg score per dimension)
2. **Stacked Bar Chart**: Daily breakdown by dimension
3. **Line Chart**: Total progress over time with 7-day moving average
4. **Calendar Heatmap**: Consistency visualization (color by score)
5. **Radar Over Time**: Dimension trends week-over-week
6. **Comparison Mode**: Current vs previous week side-by-side

### Implementation

- **Library**: Recharts (React wrapper for D3)
- **Drilldown**: Tap any day → see dimension-level details
- **Date Range**: 7d, 30d, 3m, 1y, all-time
- **Performance**: Pre-aggregated data from backend
- **Accessibility**: Screen-reader text summaries for all charts

---

## 📱 PWA & Offline Strategy

See **[offline-pwa.md](design/offline-pwa.md)** for full implementation.

### PWA Features

- **Installable**: manifest.json with icons and splash screens
- **Offline-capable**: Service worker with Workbox
- **Fast**: Asset caching (cache-first for static, network-first for API)
- **Background Sync**: Queue failed check-ins, retry when online

### Offline Check-in Flow

1. User submits check-in while offline
2. Frontend saves draft to IndexedDB
3. Frontend queues check-in payload
4. UI shows "queued" status
5. When online, service worker retries
6. Success → clear queue, update UI

### Service Worker Strategy

- **App Shell**: Cache-first (HTML, CSS, JS)
- **API Calls**: Network-first with 5-min cache fallback
- **Images**: Cache-first with 30-day expiration
- **Background Sync**: Workbox queue for POST requests

---

## 🎨 Frontend Components & Design System

See **[frontend-components.md](design/frontend-components.md)** for full component library.

### Design Tokens

**Colors**:
- Light theme: White bg, crimson accents (#DC143C, #CD5C5C)
- Dark theme: Black bg, crimson accents (#B22222, #8B0000)
- Accessible contrast (WCAG AA)

**Typography**:
- Font: Inter, system-ui fallback
- Sizes: xs (12px) to 3xl (30px)
- Line heights optimized for readability

**Spacing**:
- Scale: 4, 8, 12, 16, 20, 24, 32px
- Safe area insets for iOS notch/home indicator

### Core Components

1. **Button**: Primary, secondary, ghost, danger variants
2. **Card**: Default, elevated, bordered variants
3. **Modal**: Responsive sizes with backdrop
4. **Bottom Nav**: 5-tab navigation with primary center button
5. **SwipeCard**: Touch-enabled dimension effort selector
6. **DatePillSelector**: Horizontal scrollable date picker

### Theme System

- **ThemeProvider**: React context for light/dark/system theme
- **CSS Variables**: Dynamic theme switching
- **Tailwind Plugin**: Extended theme configuration

---

## 🕐 Timezone Handling

See **[timezone-handling.md](design/timezone-handling.md)** for full strategy.

### Simple Principle

- **Frontend**: Display dates/times in user's local timezone
- **Backend**: Store all timestamps in UTC (timestamptz)
- **Check-in Dates**: Store as DATE type (no timezone component)

### Implementation

```typescript
// Frontend: Get local date
const localDate = new Date().toISOString().split('T')[0]; // "2025-11-15"

// Send to backend
POST /api/checkins { date: "2025-11-15", ... }

// Backend: Store as-is (PostgreSQL DATE type)
date: new Date("2025-11-15")
```

### Edge Cases

- **Travel**: Each check-in uses current local date
- **DST**: JavaScript handles automatically, no special logic
- **Midnight**: Date captured at moment of frontend submission

---

## 🧪 Testing Strategy

### Unit Tests

- Score calculation logic (effort × weight)
- Component rendering (React Testing Library)
- Date/timezone utilities
- Badge evaluation rules

### Integration Tests

- API endpoints with test database
- Auth flow (mock Google OAuth)
- Check-in → streak → badge pipeline
- Leaderboard calculations

### E2E Tests

- Full user flow: signup → create journey → check-in → view stats
- Offline check-in with sync
- Mobile responsiveness (Playwright)

### Test Data

- Seed script for 3 users, 2 journeys, 30 days of check-ins
- Badge definitions seeded in migrations

---

## 🚀 Deployment

### Development

```bash
# Frontend
cd web
npm install
npm run dev  # http://localhost:5173

# Backend
cd api
npm install
npm run migrate
npm run seed
npm run dev  # http://localhost:3000
```

### Docker

```bash
docker-compose up
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# PostgreSQL: localhost:5432
```

### Production

1. Build Docker images
2. Push to container registry
3. Deploy to managed service (ECS, DigitalOcean, etc.)
4. Run migrations
5. Configure environment variables
6. Enable HTTPS
7. Set up automated backups

### Environment Variables

**Frontend**:
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_API_URL`

**Backend**:
- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NODE_ENV`

---

## 📦 Project Structure

### Monorepo Layout

```
crimson-club/
├── web/                    # React frontend
│   ├── src/
│   │   ├── app/            # Global layout, providers
│   │   ├── pages/          # Page components
│   │   ├── features/       # Feature modules (checkin, journeys, etc.)
│   │   ├── components/     # Shared UI components
│   │   ├── api/            # API client and functions
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities
│   │   └── styles/         # Global styles, tokens
│   ├── public/             # Static assets
│   └── package.json
│
├── api/                    # Node.js backend
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── journeys/
│   │   │   ├── checkins/
│   │   │   └── analytics/
│   │   ├── middleware/     # Auth, error handling
│   │   ├── lib/            # Database, logger, utils
│   │   ├── jobs/           # Background jobs (badges, leaderboard)
│   │   └── main.ts         # App entry point
│   ├── prisma/             # Database schema and migrations
│   └── package.json
│
├── design/                 # Detailed design docs (this folder)
│   ├── database-schema.md
│   ├── api-specification.md
│   ├── authentication.md
│   ├── gamification-engine.md
│   ├── charts-analytics.md
│   ├── offline-pwa.md
│   ├── frontend-components.md
│   └── timezone-handling.md
│
├── plans/                  # Planning and progress tracking
├── Spec.md                 # Product specification
├── UI_UX_Requirements.md   # UX flows and requirements
├── Design.md               # This file (overview)
├── docker-compose.yml
└── README.md
```

---

## ⚡ Performance Optimizations

### Frontend

1. **Code Splitting**: Lazy load routes and chart components
2. **Image Optimization**: WebP format, responsive images
3. **Bundle Size**: Tree-shaking, minification (Vite handles)
4. **Critical CSS**: Inline critical styles
5. **PWA Caching**: Cache-first for static assets

### Backend

1. **Database Indexes**: All foreign keys and query paths indexed
2. **Pre-aggregation**: Leaderboard and analytics pre-computed
3. **Pagination**: Limit 50-100 items per page
4. **Query Optimization**: Use EXPLAIN ANALYZE for slow queries
5. **Connection Pooling**: 10-20 connections per instance

### Database

- **Materialized Views**: Journey stats refreshed nightly
- **No Redis caching for MVP** (future optimization)
- **Efficient Queries**: Minimize joins, use indexes

---

## 🔒 Security Checklist

- ✅ HTTPS only in production
- ✅ JWT with strong secret (32+ chars)
- ✅ Google OAuth token verification on backend
- ✅ Input validation (Zod/Joi on all endpoints)
- ✅ Rate limiting (1000 req/hour per user)
- ✅ SQL injection protection (Prisma parameterized queries)
- ✅ XSS protection (React escapes by default)
- ✅ CORS configured for app domain only
- ✅ Secrets in environment variables (not in code)
- ✅ Database encryption at rest (managed PostgreSQL)

---

## 📋 MVP Scope

### Included in MVP

✅ Google OAuth authentication  
✅ Journey create/join (public and private)  
✅ Daily check-in with swipe UI (past 7 days editable)  
✅ 6 chart types for analytics  
✅ Leaderboard (week/month/all-time)  
✅ Streak tracking  
✅ Badge system (9 badges)  
✅ Offline check-in with background sync  
✅ PWA installable  
✅ Mobile-first responsive design  
✅ Dark and light themes  

### Deferred Post-MVP

❌ Push notifications  
❌ Redis caching  
❌ API versioning (v2)  
❌ Refresh tokens (JWT only for MVP)  
❌ Email/password auth (OAuth only)  
❌ Social features (comments, likes)  
❌ Journey templates  
❌ Export data (CSV, PDF)  
❌ Advanced analytics (cohort analysis)  

---

## 🎯 Development Phases

### Phase 1: Core MVP (Weeks 1-4)

- ✅ Database schema and migrations
- ✅ Auth (Google OAuth + JWT)
- ✅ Journey CRUD + join
- ✅ Check-in create/read
- ✅ Basic frontend (home, check-in, journeys)
- ✅ 2 chart types (radar, stacked bar)

### Phase 2: Analytics & Gamification (Weeks 5-7)

- ✅ All 6 chart types
- ✅ Leaderboard with caching
- ✅ Streak tracking
- ✅ Badge system (9 badges)
- ✅ Badge evaluation (real-time + nightly job)

### Phase 3: PWA & Polish (Weeks 8-10)

- ✅ Service worker + offline check-in
- ✅ PWA manifest + install prompt
- ✅ Micro-interactions (confetti, haptics, sounds)
- ✅ Dark mode
- ✅ Mobile optimizations
- ✅ Performance tuning

### Phase 4: Testing & Launch (Weeks 11-12)

- ✅ Unit and integration tests
- ✅ E2E tests (Playwright)
- ✅ Load testing
- ✅ Bug fixes
- ✅ Documentation
- ✅ Deploy to production

---

## 📞 Support & Maintenance

### Monitoring

- Structured logs (JSON with Winston/Pino)
- Error tracking (Sentry)
- Health check endpoint (`/api/health`)
- Database query performance (slow query log)

### Backups

- Daily automated PostgreSQL backups
- 30-day retention
- Point-in-time recovery enabled
- Test restores quarterly

### Updates

- Database migrations via Prisma
- Zero-downtime deployments (rolling updates)
- Feature flags (future) for gradual rollouts

---

## 🤝 Contributing Guidelines

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits
- Pre-commit hooks (Husky)

### Pull Request Process

1. Create feature branch from `main`
2. Write tests for new features
3. Ensure all tests pass
4. Update documentation
5. Submit PR with clear description
6. Code review required
7. Merge to `main` after approval

### Commit Message Format

```
feat: add badge evaluation engine
fix: correct streak calculation for missed days
docs: update API specification
refactor: simplify timezone handling
test: add integration tests for check-ins
```

---

## 📖 Additional Resources

- **Spec.md**: Product requirements and features
- **UI_UX_Requirements.md**: User flows and screen-by-screen breakdown
- **plans/**: Planning documents and session notes
- **Prisma Docs**: https://www.prisma.io/docs
- **Recharts Docs**: https://recharts.org/
- **Workbox Docs**: https://developers.google.com/web/tools/workbox

---

## ✨ Design Philosophy

1. **Mobile-First**: Every screen designed for one-handed use
2. **Offline-First**: Core functionality (check-in) works offline
3. **Clean & Minimal**: Whitespace, clear typography, focused UI
4. **Consistent**: Uniform colors, spacing, interactions
5. **Accessible**: WCAG AA compliance, keyboard navigation, screen-reader support
6. **Fast**: <2s load time, lazy loading, optimized assets
7. **Reliable**: Error handling, retry logic, clear feedback

---

## 🎨 Brand & Theme

**Name**: Crimson Club  
**Tagline**: "Track your journey, one day at a time"

**Color Palette**:
- Primary: Crimson (#DC143C)
- Accent: Dark Red (#8B0000)
- Background: Black (dark) / White (light)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Danger: Red (#EF4444)

**Tone**: Motivational, clean, disciplined, empowering

---

## 📝 Changelog

**v1.0.0-mvp** (Target: 2025-12-31)
- Initial MVP release
- All core features implemented
- PWA with offline support
- 6 chart types
- Badge and streak system

---

_This design document serves as the single source of truth for implementation. For detailed specifications, refer to the documents in the `design/` folder._

---

**Last Updated**: 2025-11-15  
**Status**: Ready for Implementation  
**Team**: Full Stack (Frontend + Backend + Database)
