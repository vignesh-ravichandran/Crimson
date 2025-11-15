# Crimson Club - Full Product Spec (MVP)

## Overview

**Crimson Club** is a mobile-first, visually clean web app for habit and progress tracking through structured daily check-ins. Users participate in "Journeys" which track progress across multiple dimensions. The app visualizes trends, motivates users through gamification, and encourages consistent self-discipline.

---

## 🎯 Core Concepts

### Journeys

* A journey is a multi-dimensional goal-tracking container.
* Can be **private** or **public**.
* Each journey has:

  * Title
  * Description
  * List of dimensions
  * Creator (admin role)

### Dimensions

* Each dimension represents a skill or behavior to track daily.
* Contains:

  * Name
  * Description
  * Example activities
  * Weight (1 to 5, for scoring)

### Daily Check-In

* Users record effort level for each dimension, once per day.
* Swipe UI for mobile experience.

### Effort Levels (Swipe Choices)

| Level | Label          | Score | Description            |
| ----- | -------------- | ----- | ---------------------- |
| 1     | Skipped        | -1    | Did not attempt        |
| 2     | Minimal Effort | 0.5   | Bare minimum           |
| 3     | Partial Effort | 1     | 50% done               |
| 4     | Solid Effort   | 2     | Fully did the activity |
| 5     | Crushed It     | 3     | Went above and beyond  |

**Final Score** = Sum of `dimension_weight * effort_score`

---

## 🔐 Roles & Permissions

| Action           | Private Journey | Public Journey |
| ---------------- | --------------- | -------------- |
| Create Journey   | ✅               | ✅              |
| Edit Dimensions  | ✅ (owner only)  | ✅ (owner only) |
| Join Journey     | ✅ (via invite)  | ✅ (open)       |
| View Leaderboard | ✅               | ✅              |
| View Charts      | ✅               | ✅              |

---

## 🧠 Features

### 1. Journey Management

* Create/Edit/Delete journeys
* Invite users (private)
* Join public journeys

### 2. Dimension Management

* Add/edit/delete dimensions (owner only)
* Set weight per dimension (1–5 scale)

### 3. Daily Tracking Flow

* Swipeable mobile UI to input effort level
* Past 7 days editable
* Autosave draft on scroll/swipe

### 4. Leaderboard

* Based on weekly/monthly/overall score
* Shows:

  * Username
  * Total Score
  * Longest Streak
  * % of days tracked

### 5. Gamification

* Streaks (tracked per dimension)
* Badges (system-generated)

  * 7-day streak → "Consistency Champ"
  * 3 "Crushed It" in week → "Beast Mode"
  * 20% improvement over prior week → "Climber"

---

## 📊 Analytics Dashboard (Per Journey)

### 1. **Radar Graph** – Multi-dimension Strengths

* Shows average scores for each dimension over selected range

### 2. **Stacked Bar Chart** – Daily Breakdown

* X: Days of week
* Y: Total score
* Stacks: Color-coded dimensions

### 3. **Line Chart** – Total Progress Over Time

* X: Days
* Y: Total score
* Optional: 7-day moving average

### 4. **Calendar Heatmap** – Consistency

* Color-coded by total score per day
* Tap = dimension-level drilldown

### 5. **Radar Over Time** – Dimension Trends

* X: Weeks
* Y: Avg score
* One line per dimension

### 6. **Leaderboard & Summary Stats**

* Sortable by score or streak
* Option to toggle between week/month/all-time

---

## 🧱 Tech Stack

### Frontend

* React.js (with Tailwind CSS)
* Mobile-first with swipeable UX
* Charts: Recharts (Radar, Bar, Line), Calendar Heatmap

### Backend

* Node.js (Express or NestJS)
* Auth: JWT-based (custom or Auth0/NextAuth) - simple gmail oauth 
* DB: PostgreSQL




---

## ⛓️ Database Schema Overview

### Users

* id (UUID)
* username
* email
* password_hash
* created_at

### Journeys

* id
* title
* description
* is_public (boolean)
* created_by (user_id FK)

### Dimensions

* id
* journey_id (FK)
* name
* description
* examples (JSON or array)
* weight (1–5)

### Checkins

* id
* user_id (FK)
* journey_id (FK)
* date (DATE)

### Checkin_Details

* id
* checkin_id (FK)
* dimension_id (FK)
* effort_level (1–5)

### Leaderboard_View (Materialized View or Aggregated Endpoint)

* user_id
* journey_id
* total_score
* streak_count
* completion_rate

### Badges

* id
* name
* description
* icon_url (optional)

### User_Badges

* id
* user_id
* badge_id
* journey_id (optional)
* awarded_on

---

## ✅ MVP Development Phases

### Phase 1: Core Tracker

* Auth + User setup
* Journey create/join
* Dimension setup
* Daily Check-in UI (swipe)
* Simple score logic
* Charts: Radar, Stacked Bar

### Phase 2: Leaderboard + Gamification

* Score engine with weights
* Leaderboard views
* Streak tracker
* Badge engine
* Calendar Heatmap

### Phase 3: Dashboard Polish + Mobile PWA

* Full dashboard + summary
* Offline-ready PWA support
* Smooth swipe transitions

---

## ✨ UI/UX Design Guidelines

Clean → whitespace, minimalist typography

Consistent → one color scheme, uniform button spacing, etc.

Crimson Theme

Dark Mode → Black background with blood red accents (e.g., #8B0000, #B22222)

Light Mode → White background with soft crimson accents (e.g., #DC143C, #CD5C5C)

Mobile First → Bottom nav, swipeable cards, edge-snap

Use micro-interactions (confetti, sound, haptics) on "Crushed It"

---

## 🌟 Final Notes

* **No chat or comments** → clean focus
* **No reminders for now** → minimal pressure
* **Public Journeys are open but editable only by creator**
* **Every screen designed for one-handed use**

