## Crimson Club — UI / UX Notes & Detailed Requirements

This document converts the high-level product spec in `Spec.md` into actionable UI/UX notes, screen breakdowns, component specs, data/state requirements, interaction details (mobile-first), accessibility checks, acceptance criteria, and next steps.

---

## 1) Quick contract

- Inputs: user identity (auth), journey definition (title, description, dimensions), daily check-ins (one per day per user per journey, with per-dimension effort). 
- Outputs: per-user scores, journey-level analytics (radar, stacked bar, line, calendar heatmap), leaderboards, badges, streaks, and UI states.
- Error modes: offline/add conflicts (draft autosaves), missing permissions (private journeys), invalid weights/effort values, server errors.
- Success criteria: users can create/join journeys, submit daily check-ins with a swipe-first mobile UX, see accurate scores and charts, and view leaderboards.

---

## 2) Target users & scenarios

- Primary persona: mobile-first goal-oriented user who wants frictionless daily tracking and visual motivation.
- Secondary persona: group-oriented user who joins public journeys/leaderboards for social motivation.

Common tasks:
- Create a Journey with dimensions and weights.
- Mark daily efforts (swipe cards) for each dimension quickly.
- Inspect personal and journey analytics (radar, calendar heatmap, line charts).
- View leaderboard and badges.

---

## 3) Mobile-first top-level flows (one-handed)

1. Onboarding / Auth
   - Simple OAuth / email sign-in screen.
   - Minimal required profile fields: username, display name, avatar optional.

2. Home / Dashboard (default bottom nav)
   - Quick-check CTA: "Daily Check-In" (primary bottom center action).
   - Summary tiles: Current streak, % tracked (7-day), Next check-in pending, Top dimension this week.
   - Recent journeys (carousel) — swipe left/right.

3. Daily Check-In Flow (Primary Experience)
   - Entry: Tap Quick-check or open a Journey → Check-In screen.
   - For active journey: show stacked swipeable cards — one per dimension (mobile full-height card).
   - Card content: dimension name, examples, short goal text, weight chip, effort choices.
   - Interaction: swipe left/right to select effort level (1..5). Alternative: tap on discrete buttons along bottom of card.
   - Autosave: partial selection saved as draft on swipe/scroll.
   - Editing past 7 days: horizontal pill selector for date above cards.

4. Journey Management
   - Create Journey modal/flow: Title, Description, visibility (private/public), add dimensions (name, desc, examples, weight 1-5), invite users for private.
   - Edit Journey: owner-only; changes to dimensions prompt owner confirmation re: historical scoring (note: weights changes do not retroactively change past scores without confirmation).

5. Analytics / Dashboard per Journey
   - Top controls: date range selector + compare mode.
   - Chart area: switch between Radar, Stacked Bar, Line Chart, Calendar Heatmap, Radar-over-time.
   - Drilldown: tap chart day to open dimension-level check-ins from that day.

6. Leaderboard & Social
   - Toggle range: Week / Month / All-time.
   - Sort: Score / Streak / %Tracked.
   - Profile popover: summary and recent week sparkline.

7. Badges & Gamification
   - Badge cards appear when earned (micro-interaction: confetti + subtle vibration + sound toggle setting).
   - Badge page lists unlocked and locked badges with criteria tooltips.

---

## 4) Screen-by-screen breakdown (content + components + acceptance)

### A. Splash / Auth Screen
- Components: app logo, sign-in with Google (or OAuth), continue with email, privacy note link.
- Acceptance: successful OAuth opens Home; failed login shows inline error with retry.

### B. Home / Dashboard
- Components: bottom nav (Home, Journeys, Check-In, Stats, Profile), Quick-check CTA, journey carousel, summary metrics.
- State: fetch user's journeys, current streaks, current pending check-ins.
- Acceptance: Home shows at least top 3 journeys or CTA to create one; Quick-check opens last-used journey's check-in.

### C. Journey List / Detail
- Components: journey card (title, visibility badge, progress bar), action menu (join/invite/edit for owners), CTA to check-in.
- Acceptance: Owner sees "Edit"; public join shows "Join".

### D. Create / Edit Journey
- Components: form fields (title, description), visibility toggle, dimension list with add/edit rows, weight selector (1-5), examples textarea, save/cancel.
- Validation: title required, at least 1 dimension required, weight between 1 and 5.
- Acceptance: On save, backend returns journey id and navigates to Journey Detail.

### E. Daily Check-in (primary)
- Components: date selector (past 7 days), swipeable card stack, effort feedback UI (small chips showing selected score and computed total), submit/auto-save indicator.
- Interaction specifics:
  - Swiping right increases effort, left decreases (visual affordances like progress ticks).
  - Tap to open full effort selector modal to choose exact level.
  - When last required dimension checked, show completion microcopy and subtle confetti if Crushed It selected for any dimension.
- Acceptance: Recording a full-day check-in stores Checkin and Checkin_Details rows for user and updates local cache and short-term UI.

### F. Stats / Analytics
- Components: chart selector, charts area, legend, export/share button (maybe later), date range.
- Acceptance: Charts reflect backend aggregated data; tapping a day opens the day's check-in details.

### G. Leaderboard
- Components: ranking list, filters, user highlight, join/compare button.
- Acceptance: Sorting & filters update UI quickly; user rank always shown.

### H. Profile/Badges
- Components: avatar, stats summary, badge grid, settings for sounds/haptics.
- Acceptance: Clicking a badge shows criteria; earned badges persist and can be re-shown.

---

## 5) Visual design & theme notes

- Theme: "Crimson" primary accent; provide tokens for Light and Dark modes.
  - Primary (dark accents): #8B0000, #B22222 (use for CTA, progress bars)
  - Primary (light accents): #DC143C, #CD5C5C
  - Neutral backgrounds: dark mode #000000 / #121212, light mode #FFFFFF / #F7F7F8
  - Success/positive: green (for small states), neutral grays for text.

- Typography: clean sans-serif (system stack). Sizes scaled for one-handed reads.
- Spacing: generous whitespace; cards with 16–20px padding.
- Buttons: large primary CTA for Check-In; secondary as ghost.

Micro-interactions:
- Swipe micro-animation with edge-snap and small haptic feedback on iOS.
- Confetti when "Crushed It" on a dimension or when earning badge.
- Smooth transitions between charts and date ranges.

Accessibility:
- Color contrast: ensure text over crimson accents passes 4.5:1 where used for body text; use white or dark text on accent backgrounds accordingly.
- Label all interactive controls; provide ARIA roles for charts and provide textual summaries beneath charts for screen readers.
- Respect user reduced-motion setting.

---

## 6) Data & state mapping (UI → DB)

- Journey create flow → POST /journeys with payload: { title, description, is_public, dimensions: [{name, description, examples, weight}] }
- Check-In UI → POST /checkins (user_id, journey_id, date) and POST /checkin_details for each dimension with effort_level (1–5).
- Draft behavior: store local draft keyed by user/journey/date (localStorage or IndexedDB) and sync on network.
- Analytics endpoints: aggregated endpoints for radar, daily stacks, calendar heatmap with date-range query params.

Edge cases:
- Timezones: store and display check-ins normalized to user timezone; show local date for check-in.
- Multiple checkins in same day: disallow duplicate checkins; allow edit of same-day checkin until midnight or until owner sets lock.
- Weight changes: changing a dimension weight should prompt owner to either apply changes only forward or recalculate historical scores (explicit opt-in).

---

## 7) Error states & offline behavior

- Offline: allow local draft of check-ins, show offline indicator, attempt background sync when back online; show conflict resolution if server has newer checkin.
- Partial save failures: indicate which dimension failed to save, allow retry per-dimension.
- Permission errors: trying to edit a public journey as non-owner shows read-only state and clear CTA to request change.

---

## 8) Acceptance criteria & test cases (per screen, minimal QA)

- Create Journey: happy path creates journey and dimensions; validation prevents empty title or zero dimensions.
- Daily Check-in: user can swipe through all dimensions for a given day and save; saved checkin visible in calendar heatmap and reflected in total score.
- Analytics: Radar shows correct averaged values for selected date range; line chart updates when changing date range.
- Leaderboard: rankings update weekly and monthly; user appears and rank matches backend aggregate.
- Offline: create a checkin offline, then go online; checkin syncs correctly.

Suggested automated tests:
- Unit tests for score calculation (weights × effort) with boundary values.
- Integration test: create journey + add dimensions + submit check-ins for 3 users → leaderboard endpoint reflects expected order.

---

## 9) Wireframes & layout suggestions (low-fidelity)

- Home: top status row → journey carousel → summary tiles → bottom nav with large center "Check-In".
- Check-in: date pill selector top; large card stack center with dimension name and examples; bottom shows effort chips and computed day total.
- Stats: full-bleed chart area with small legend under it, toggles for chart type.

Deliver wireframe pages for these views (Figma/Sketch):
1. Onboarding/Auth
2. Home
3. Check-In (empty day + partially filled + completed)
4. Create Journey
5. Journey Dashboard (Charts)
6. Leaderboard
7. Profile / Badges

---

## 10) Assets & dev handoff notes

Required assets:
- Icons: dimension icons (or generic tokens), badge icons (SVG), app logo, onboarding illustrations (optional)
- Colors: token JSON for both light and dark modes
- Microcopy: a short set of strings (empty states, error messages, badge criteria copy)

Handoff package should include:
- Figma file with components, tokens, and sample screens.
- A small component library (React + Tailwind variants) for: Card, Button, BottomNav, SwipeCard, DatePill, ChartWrapper.

---

## 11) Performance & analytics considerations

- Load charts lazily; fetch aggregated endpoints rather than raw checkins.
- Use pagination for leaderboard and lazy-load avatars.
- Track analytic events for: Check-in completed, Badge earned, Journey created, Join journey, Leaderboard viewed.

---

## 12) Next steps & recommended timeline (MVP-focused)

Short-term (1–2 sprints):
- Finalize design tokens and primary flows (Onboarding, Create Journey, Check-in, Stats radar/stacked bar) — deliver low-fidelity -> high-fidelity in Figma.
- Dev: implement Check-in UI and score engine; write unit tests for scoring and a small integration test for checkin persistence.

Mid-term (2–4 sprints):
- Leaderboard & badges, calendar heatmap, offline sync.
- Polish micro-interactions and dark mode.

Deliverables I can produce if you want (I can continue):
- A clickable low-fi prototype in Figma (or hand-drawn wireframes as PNG).
- A component spec file (React + Tailwind) with sample markup.
- Acceptance test checklist in a test framework (Jest + React Testing Library).

---

## 13) Notes & assumptions

- Assumed single daily check-in per user per journey; editing allowed within 7 days.
- Assumed Recharts for charts as in `Spec.md`.
- Assumed OAuth + JWT for auth as listed.

If any assumptions should change (e.g., allow multiple daily check-ins, different auth provider), I will update the flows and data mappings accordingly.

---

## 14) Closing summary

I translated `Spec.md` into a mobile-first UI/UX requirements file with clear screen breakdowns, components, data mapping, acceptance tests, wireframe deliverables, and next steps. The next action is finishing a high-fidelity Figma prototype and the developer component spec.



