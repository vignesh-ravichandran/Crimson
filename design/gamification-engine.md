# Gamification Engine - Crimson Club

Complete specification for badges, streaks, and motivational features.

---

## Overview

The gamification engine encourages consistent engagement through:
1. **Streaks** - Daily check-in consistency tracking
2. **Badges** - Achievement rewards based on milestones
3. **Micro-celebrations** - UI feedback for accomplishments

**No notifications** for MVP - badges appear in-app only.

---

## 1. Streak System

### 1.1 Streak Definition

A **streak** is a count of consecutive days a user completes a check-in for a journey.

**Rules**:
- A day counts if the user submits at least one effort level for all dimensions
- Consecutive days increment the streak
- Missing a day (no check-in) resets current streak to 0
- Grace period: None for MVP (strict daily requirement)

### 1.2 Streak Tracking

**Database**: `streaks` table per user per journey
- `current_streak`: Running count of consecutive days
- `longest_streak`: All-time best streak
- `last_checkin_date`: Last recorded check-in date

### 1.3 Streak Calculation Algorithm

**Trigger**: When a check-in is created or updated

```typescript
async function updateStreak(userId: string, journeyId: string, checkinDate: Date) {
  // Get existing streak record
  let streak = await db.streaks.findUnique({
    where: { userId_journeyId: { userId, journeyId } }
  });

  if (!streak) {
    // First check-in for this journey
    streak = await db.streaks.create({
      data: {
        userId,
        journeyId,
        current_streak: 1,
        longest_streak: 1,
        last_checkin_date: checkinDate
      }
    });
    return streak;
  }

  // Calculate day difference
  const daysDiff = calculateDayDifference(streak.last_checkin_date, checkinDate);

  if (daysDiff === 0) {
    // Same day update - no change to streak
    return streak;
  } else if (daysDiff === 1) {
    // Consecutive day - increment streak
    const newCurrent = streak.current_streak + 1;
    const newLongest = Math.max(newCurrent, streak.longest_streak);
    
    await db.streaks.update({
      where: { id: streak.id },
      data: {
        current_streak: newCurrent,
        longest_streak: newLongest,
        last_checkin_date: checkinDate
      }
    });

    // Check for streak badges
    await evaluateStreakBadges(userId, journeyId, newCurrent);
    
    return { ...streak, current_streak: newCurrent, longest_streak: newLongest };
  } else {
    // Missed days - reset current streak
    await db.streaks.update({
      where: { id: streak.id },
      data: {
        current_streak: 1,
        last_checkin_date: checkinDate
      }
    });
    
    return { ...streak, current_streak: 1 };
  }
}

function calculateDayDifference(date1: Date, date2: Date): number {
  // Normalize to user's local date (already done at API layer)
  const d1 = new Date(date1).setHours(0, 0, 0, 0);
  const d2 = new Date(date2).setHours(0, 0, 0, 0);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}
```

### 1.4 Streak Display

**UI Components**:
- **Streak Badge**: Shows 🔥 icon with current streak number
- **Streak Chart**: Mini line chart showing last 30 days (green dots for check-ins)
- **Longest Streak**: Display in profile and journey stats

**Example UI**:
```
🔥 7 Day Streak
━━━━━━━━━━━━━━━━━━━
Personal Best: 12 days
```

---

## 2. Badge System

### 2.1 Badge Types

Three categories:
1. **Streak Badges** - Based on consecutive check-ins
2. **Performance Badges** - Based on effort levels
3. **Milestone Badges** - Based on total participation

### 2.2 Badge Definitions

Seeded in `badges` table at deployment.

#### Streak Badges

| Key | Name | Criteria | Description |
|-----|------|----------|-------------|
| `streak_3` | Getting Started | 3-day streak | You're building the habit! |
| `streak_7` | Week Warrior | 7-day streak | One full week of consistency! |
| `streak_14` | Fortnight Fighter | 14-day streak | Two weeks strong! |
| `streak_30` | Month Master | 30-day streak | A full month of dedication! |
| `streak_100` | Century Club | 100-day streak | Elite consistency! |

#### Performance Badges

| Key | Name | Criteria | Description |
|-----|------|----------|-------------|
| `beast_mode` | Beast Mode | 3+ "Crushed It" (level 5) in one week | You dominated this week! |
| `perfect_week` | Perfect Week | All level 4-5 for 7 consecutive days | Flawless execution! |
| `comeback_kid` | Comeback Kid | Return after 7+ day gap and maintain 7-day streak | Welcome back, champion! |

#### Milestone Badges

| Key | Name | Criteria | Description |
|-----|------|----------|-------------|
| `first_checkin` | First Step | Complete first check-in | Your journey begins! |
| `journey_creator` | Journey Starter | Create your first journey | Leading the way! |
| `climber` | Climber | 20%+ improvement over previous week | You're leveling up! |
| `century_checkins` | Centurion | 100 total check-ins | Proven dedication! |

### 2.3 Badge Data Structure

**badges table**:
```json
{
  "id": "uuid",
  "key": "streak_7",
  "name": "Week Warrior",
  "description": "One full week of consistency!",
  "criteria": {
    "type": "streak",
    "days": 7
  },
  "icon_url": "/assets/badges/streak-7.svg",
  "tier": "bronze"
}
```

**Criteria Types**:

1. **Streak Badge**:
```json
{
  "type": "streak",
  "days": 7
}
```

2. **Performance Badge (Crushed Count)**:
```json
{
  "type": "crushed_count",
  "count": 3,
  "period": "week"
}
```

3. **Perfect Week**:
```json
{
  "type": "perfect_week",
  "min_effort_level": 4,
  "days": 7
}
```

4. **Improvement**:
```json
{
  "type": "improvement",
  "percentage": 20,
  "comparison": "previous_week"
}
```

### 2.4 Badge Evaluation Engine

**Triggers**:
1. **Real-time**: When check-in is submitted (for immediate badges like first_checkin)
2. **Nightly Job**: Batch evaluate all users for time-based badges (runs at 00:00 UTC)

#### Real-time Badge Check

```typescript
async function evaluateBadgesOnCheckin(
  userId: string, 
  journeyId: string, 
  checkinId: string
) {
  const checkin = await db.checkins.findUnique({
    where: { id: checkinId },
    include: { 
      details: { include: { dimension: true } },
      journey: true
    }
  });

  // Check first check-in badge
  const userCheckinCount = await db.checkins.count({
    where: { userId, journeyId }
  });
  
  if (userCheckinCount === 1) {
    await awardBadge(userId, journeyId, 'first_checkin', {
      checkin_date: checkin.date
    });
  }

  // Check for crushed count this week
  const weekStart = startOfWeek(new Date());
  const crushedCount = await db.checkinDetails.count({
    where: {
      checkin: {
        userId,
        journeyId,
        date: { gte: weekStart }
      },
      effort_level: 5
    }
  });

  if (crushedCount >= 3) {
    await awardBadge(userId, journeyId, 'beast_mode', {
      crushed_count: crushedCount,
      week: formatWeek(weekStart)
    });
  }
}
```

#### Nightly Batch Job

```typescript
async function runNightlyBadgeEvaluation() {
  console.log('[Badge Engine] Starting nightly evaluation...');

  // Get all active journey members
  const members = await db.journeyMembers.findMany({
    where: {
      journey: { status: 'active' }
    },
    include: {
      journey: true,
      user: true
    }
  });

  for (const member of members) {
    await evaluatePerfectWeek(member.userId, member.journeyId);
    await evaluateImprovement(member.userId, member.journeyId);
    await evaluateCenturyCheckins(member.userId, member.journeyId);
  }

  console.log(`[Badge Engine] Evaluated ${members.length} members`);
}

async function evaluatePerfectWeek(userId: string, journeyId: string) {
  // Check last 7 days for all level 4-5
  const last7Days = getLast7Days();
  const checkins = await db.checkins.findMany({
    where: {
      userId,
      journeyId,
      date: { in: last7Days }
    },
    include: { details: true }
  });

  if (checkins.length !== 7) return; // Not all days checked in

  const allHighEffort = checkins.every(c =>
    c.details.every(d => d.effort_level >= 4)
  );

  if (allHighEffort) {
    await awardBadge(userId, journeyId, 'perfect_week', {
      week_start: last7Days[0]
    });
  }
}

async function evaluateImprovement(userId: string, journeyId: string) {
  const thisWeek = await getWeekScore(userId, journeyId, 0);
  const lastWeek = await getWeekScore(userId, journeyId, -1);

  if (lastWeek === 0) return; // No previous data

  const improvement = ((thisWeek - lastWeek) / lastWeek) * 100;

  if (improvement >= 20) {
    await awardBadge(userId, journeyId, 'climber', {
      last_week_score: lastWeek,
      this_week_score: thisWeek,
      improvement_percent: improvement.toFixed(1)
    });
  }
}
```

### 2.5 Award Badge Function

```typescript
async function awardBadge(
  userId: string,
  journeyId: string | null,
  badgeKey: string,
  metadata: Record<string, any> = {}
) {
  // Check if badge already awarded
  const badge = await db.badges.findUnique({ where: { key: badgeKey } });
  if (!badge) {
    console.error(`Badge ${badgeKey} not found`);
    return;
  }

  const existing = await db.userBadges.findFirst({
    where: { userId, badgeId: badge.id, journeyId }
  });

  if (existing) {
    console.log(`Badge ${badgeKey} already awarded to user ${userId}`);
    return;
  }

  // Award the badge
  const userBadge = await db.userBadges.create({
    data: {
      userId,
      badgeId: badge.id,
      journeyId,
      metadata
    }
  });

  console.log(`✨ Awarded badge ${badge.name} to user ${userId}`);

  // Trigger UI celebration (handled by real-time event)
  await triggerBadgeCelebration(userId, badge);

  return userBadge;
}
```

---

## 3. Micro-Celebrations

Visual and tactile feedback for achievements.

### 3.1 Celebration Triggers

| Event | Celebration |
|-------|-------------|
| Effort level 5 selected | Confetti + haptic |
| Badge earned | Confetti + modal + haptic |
| Streak milestone (7, 14, 30) | Badge modal + haptic |
| Perfect week completed | Special animation + haptic |

### 3.2 Implementation

#### Confetti Effect

Use `canvas-confetti` library:

```typescript
import confetti from 'canvas-confetti';

function celebrateCrushedIt() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#DC143C', '#8B0000', '#FFD700']
  });
}
```

#### Haptic Feedback

Use Web Vibration API:

```typescript
function triggerHaptic(pattern: 'light' | 'medium' | 'heavy') {
  if (!navigator.vibrate || !userSettings.haptics) return;

  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30, 10, 30]
  };

  navigator.vibrate(patterns[pattern]);
}
```

#### Sound Effects

Use Howler.js or native Audio API:

```typescript
class SoundManager {
  private sounds: Map<string, HTMLAudioElement>;

  constructor() {
    this.sounds = new Map();
    this.load('badge', '/sounds/badge-earned.mp3');
    this.load('streak', '/sounds/streak-milestone.mp3');
    this.load('crushed', '/sounds/crushed-it.mp3');
  }

  play(key: string) {
    if (!userSettings.sounds) return;
    
    const sound = this.sounds.get(key);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.warn('Audio play failed:', e));
    }
  }
}
```

### 3.3 Badge Award Modal

```typescript
// Component: BadgeAwardModal
interface Props {
  badge: Badge;
  onClose: () => void;
}

function BadgeAwardModal({ badge, onClose }: Props) {
  useEffect(() => {
    triggerHaptic('heavy');
    celebrateBadgeEarned();
    soundManager.play('badge');
  }, []);

  return (
    <Modal open onClose={onClose}>
      <div className="text-center p-8">
        <div className="text-6xl mb-4">{badge.icon}</div>
        <h2 className="text-2xl font-bold text-primary-500">
          {badge.name}
        </h2>
        <p className="text-muted mt-2">{badge.description}</p>
        <button 
          onClick={onClose}
          className="mt-6 btn-primary"
        >
          Awesome! 🎉
        </button>
      </div>
    </Modal>
  );
}
```

---

## 4. Gamification API Endpoints

### Get User Badges

```
GET /api/v1/users/:userId/badges?journeyId={optional}

Response:
{
  "data": [
    {
      "id": "uuid",
      "badge": {
        "key": "streak_7",
        "name": "Week Warrior",
        "description": "One full week of consistency!",
        "icon_url": "/assets/badges/streak-7.svg",
        "tier": "bronze"
      },
      "awarded_on": "2025-11-15T10:30:00Z",
      "metadata": {
        "streak_count": 7,
        "week": "2025-W46"
      }
    }
  ]
}
```

### Get User Streaks

```
GET /api/v1/users/:userId/streaks?journeyId={optional}

Response:
{
  "data": [
    {
      "journey_id": "uuid",
      "journey_title": "30-Day Fitness",
      "current_streak": 7,
      "longest_streak": 12,
      "last_checkin_date": "2025-11-15"
    }
  ]
}
```

---

## 5. Badge Seed Data

```typescript
// seed/badges.ts
export const BADGES = [
  // Streak badges
  {
    key: 'streak_3',
    name: 'Getting Started',
    description: "You're building the habit!",
    criteria: { type: 'streak', days: 3 },
    tier: 'bronze',
    icon_url: '/assets/badges/streak-3.svg'
  },
  {
    key: 'streak_7',
    name: 'Week Warrior',
    description: 'One full week of consistency!',
    criteria: { type: 'streak', days: 7 },
    tier: 'silver',
    icon_url: '/assets/badges/streak-7.svg'
  },
  {
    key: 'streak_30',
    name: 'Month Master',
    description: 'A full month of dedication!',
    criteria: { type: 'streak', days: 30 },
    tier: 'gold',
    icon_url: '/assets/badges/streak-30.svg'
  },
  {
    key: 'streak_100',
    name: 'Century Club',
    description: 'Elite consistency!',
    criteria: { type: 'streak', days: 100 },
    tier: 'platinum',
    icon_url: '/assets/badges/streak-100.svg'
  },

  // Performance badges
  {
    key: 'beast_mode',
    name: 'Beast Mode',
    description: 'You dominated this week!',
    criteria: { type: 'crushed_count', count: 3, period: 'week' },
    tier: 'gold',
    icon_url: '/assets/badges/beast-mode.svg'
  },
  {
    key: 'perfect_week',
    name: 'Perfect Week',
    description: 'Flawless execution!',
    criteria: { type: 'perfect_week', min_effort_level: 4, days: 7 },
    tier: 'gold',
    icon_url: '/assets/badges/perfect-week.svg'
  },

  // Milestone badges
  {
    key: 'first_checkin',
    name: 'First Step',
    description: 'Your journey begins!',
    criteria: { type: 'milestone', event: 'first_checkin' },
    tier: 'bronze',
    icon_url: '/assets/badges/first-step.svg'
  },
  {
    key: 'journey_creator',
    name: 'Journey Starter',
    description: 'Leading the way!',
    criteria: { type: 'milestone', event: 'create_journey' },
    tier: 'bronze',
    icon_url: '/assets/badges/journey-starter.svg'
  },
  {
    key: 'climber',
    name: 'Climber',
    description: "You're leveling up!",
    criteria: { type: 'improvement', percentage: 20, comparison: 'previous_week' },
    tier: 'silver',
    icon_url: '/assets/badges/climber.svg'
  }
];
```

---

## 6. Performance Considerations

- **Batch evaluations**: Run nightly job for non-urgent badges
- **Real-time checks**: Only evaluate simple badges on check-in submission
- **Database queries**: Use indexes on `user_badges(user_id, awarded_on)` for fast lookups
- **Caching**: Cache user badges in Redis with 5-minute TTL

---

## 7. Future Enhancements (Post-MVP)

- **Social Badges**: "Invited 5 friends", "Most improved in journey"
- **Seasonal Badges**: Special holiday or event badges
- **Leaderboard Badges**: "Top 10 this month"
- **Badge Progress**: Show progress toward next badge (e.g., "3/7 days for Week Warrior")
- **Badge Sharing**: Share badge achievements on social media

---

_Gamification engine designed to motivate without overwhelming - clean, celebratory, and achievement-focused._

