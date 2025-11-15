# Design Documentation

This folder contains detailed technical specifications for implementing Crimson Club. Start with the main [Design.md](../Design.md) for an overview, then dive into specific documents as needed.

---

## 📖 Quick Navigation

### Start Here
- **[../Design.md](../Design.md)** - Main overview and architecture (read this first!)

### Core Specifications

#### Backend
- **[database-schema.md](database-schema.md)** - PostgreSQL schema (11 tables, triggers, queries)
- **[api-specification.md](api-specification.md)** - REST API endpoints (40+ endpoints)
- **[authentication.md](authentication.md)** - Google OAuth + JWT implementation

#### Frontend
- **[frontend-components.md](frontend-components.md)** - UI components and design tokens
- **[charts-analytics.md](charts-analytics.md)** - All 6 chart types with implementations
- **[offline-pwa.md](offline-pwa.md)** - PWA, service worker, offline strategy

#### Features
- **[gamification-engine.md](gamification-engine.md)** - Badges, streaks, micro-celebrations
- **[timezone-handling.md](timezone-handling.md)** - Simple timezone strategy (FE local, BE UTC)

---

## 🎯 By Use Case

### "I'm implementing authentication"
1. Read [authentication.md](authentication.md)
2. Reference [database-schema.md](database-schema.md#1-users)
3. Check [api-specification.md](api-specification.md#1-authentication-endpoints)

### "I'm building the check-in UI"
1. Read [frontend-components.md](frontend-components.md#3-check-in-components)
2. Reference [offline-pwa.md](offline-pwa.md#3-offline-check-in-flow)
3. Check [api-specification.md](api-specification.md#3-check-in-endpoints)

### "I'm implementing charts"
1. Read [charts-analytics.md](charts-analytics.md)
2. Reference [api-specification.md](api-specification.md#4-analytics-endpoints)
3. Check [database-schema.md](database-schema.md) for query examples

### "I'm setting up the database"
1. Read [database-schema.md](database-schema.md)
2. Implement tables in order (users → journeys → dimensions → etc.)
3. Add triggers and materialized views
4. Seed badge data from [gamification-engine.md](gamification-engine.md#25-badge-seed-data)

### "I'm implementing gamification"
1. Read [gamification-engine.md](gamification-engine.md)
2. Reference [database-schema.md](database-schema.md) (badges, streaks tables)
3. Check [api-specification.md](api-specification.md#6-gamification-endpoints)

### "I'm making the app offline-capable"
1. Read [offline-pwa.md](offline-pwa.md)
2. Reference [frontend-components.md](frontend-components.md) for UI
3. Test with Chrome DevTools offline mode

---

## 📋 Document Overview

| Document | Lines | Key Contents |
|----------|-------|--------------|
| [database-schema.md](database-schema.md) | ~680 | Tables, indexes, triggers, SQL queries, materialized views |
| [api-specification.md](api-specification.md) | ~720 | 40+ endpoints, request/response formats, pagination, errors |
| [authentication.md](authentication.md) | ~480 | OAuth flow, JWT middleware, frontend/backend code |
| [gamification-engine.md](gamification-engine.md) | ~520 | 9 badges, streak algorithms, confetti/haptics/sounds |
| [charts-analytics.md](charts-analytics.md) | ~630 | 6 chart types, data structures, React components, drilldown |
| [offline-pwa.md](offline-pwa.md) | ~550 | Manifest, service worker, offline sync, IndexedDB |
| [frontend-components.md](frontend-components.md) | ~540 | Design tokens, 10+ components, SwipeCard, theme system |
| [timezone-handling.md](timezone-handling.md) | ~320 | Simple strategy, edge cases, testing |

**Total: ~4,440 lines** of implementation-ready documentation

---

## 🔍 Finding What You Need

### By Technology
- **PostgreSQL**: [database-schema.md](database-schema.md)
- **REST API**: [api-specification.md](api-specification.md)
- **React**: [frontend-components.md](frontend-components.md), [charts-analytics.md](charts-analytics.md)
- **OAuth**: [authentication.md](authentication.md)
- **PWA**: [offline-pwa.md](offline-pwa.md)
- **TypeScript**: All files have TS examples

### By Feature
- **Check-ins**: [api-specification.md](api-specification.md#3-check-in-endpoints), [frontend-components.md](frontend-components.md#3-check-in-components)
- **Journeys**: [database-schema.md](database-schema.md#2-journeys), [api-specification.md](api-specification.md#2-journey-endpoints)
- **Leaderboard**: [database-schema.md](database-schema.md#11-leaderboard_cache), [api-specification.md](api-specification.md#5-leaderboard-endpoints)
- **Badges**: [gamification-engine.md](gamification-engine.md#2-badge-system)
- **Streaks**: [gamification-engine.md](gamification-engine.md#1-streak-system)
- **Charts**: [charts-analytics.md](charts-analytics.md#1-chart-types)

---

## 🏗️ Implementation Order

Recommended order for building the MVP:

### Week 1-2: Foundation
1. Set up database from [database-schema.md](database-schema.md)
2. Implement auth from [authentication.md](authentication.md)
3. Create basic API structure from [api-specification.md](api-specification.md)

### Week 3-4: Core Features
4. Build journey CRUD (create, read, update, delete)
5. Implement check-in API and UI
6. Add 2 basic charts (radar, stacked bar)

### Week 5-6: Analytics
7. Complete all 6 charts from [charts-analytics.md](charts-analytics.md)
8. Implement leaderboard
9. Add chart drilldown

### Week 7-8: Gamification
10. Build badge system from [gamification-engine.md](gamification-engine.md)
11. Implement streak tracking
12. Add micro-celebrations (confetti, haptics)

### Week 9-10: PWA & Polish
13. Implement PWA from [offline-pwa.md](offline-pwa.md)
14. Add offline check-in with background sync
15. Dark mode and theme switching
16. Performance optimization

### Week 11-12: Testing & Launch
17. Write unit and integration tests
18. E2E testing with Playwright
19. Load testing
20. Deploy to production

---

## 💡 Tips for Developers

### Code Examples
All documents include TypeScript, React, and SQL code examples you can use directly.

### Testing
Each document includes testing strategies and example test cases.

### Edge Cases
Common edge cases are documented (timezone changes, offline sync conflicts, etc.)

### Performance
Optimization strategies included in relevant sections (indexes, caching, pagination).

### Security
Security considerations documented in [authentication.md](authentication.md) and [api-specification.md](api-specification.md).

---

## 🤝 Contributing

When updating these docs:
1. Keep examples practical and copy-pasteable
2. Document edge cases and gotchas
3. Add SQL queries for complex operations
4. Include TypeScript interfaces
5. Cross-reference related documents
6. Update this README if adding new files

---

## 📚 Related Documents

- **[../Spec.md](../Spec.md)** - Product specification (what we're building)
- **[../UI_UX_Requirements.md](../UI_UX_Requirements.md)** - UX flows and requirements
- **[../plans/](../plans/)** - Planning and progress tracking

---

## ❓ Common Questions

**Q: Where do I start?**  
A: Read [../Design.md](../Design.md) first for the big picture, then dive into specific docs.

**Q: I need to implement feature X, which doc?**  
A: Use the "By Use Case" section above or search for the feature name.

**Q: Are there code examples?**  
A: Yes! Every document has TypeScript, SQL, and React examples.

**Q: Is this production-ready?**  
A: Yes, these specs are implementation-ready for MVP development.

**Q: What about post-MVP features?**  
A: Post-MVP items are marked with ❌ in the main Design.md.

---

_Last updated: November 15, 2025_

