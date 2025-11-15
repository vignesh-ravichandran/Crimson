# Timezone Handling - Crimson Club

Simple timezone strategy: Frontend shows local time, backend stores UTC.

---

## Overview

**Principle**: Keep it simple and consistent
- **Frontend**: Display all dates/times in user's local timezone
- **Backend**: Store all timestamps in UTC (PostgreSQL `timestamptz`)
- **Check-in Date**: Store as DATE type, normalized to user's local date

---

## 1. Strategy

### 1.1 User Timezone Storage

Store user's IANA timezone in `users.settings`:

```json
{
  "timezone": "America/New_York"
}
```

**Detection**: Use JavaScript `Intl.DateTimeFormat().resolvedOptions().timeZone`

---

## 2. Frontend Implementation

### 2.1 Timezone Detection

```typescript
// src/lib/timezone.ts
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC'; // Fallback
  }
}

export function saveUserTimezone() {
  const timezone = getUserTimezone();
  localStorage.setItem('userTimezone', timezone);
  return timezone;
}
```

### 2.2 Date Formatting

```typescript
// src/lib/date-utils.ts
export function formatDateInUserTimezone(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
}

export function formatDateTimeInUserTimezone(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

export function getTodayAsLocalDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

### 2.3 Check-in Date Normalization

```typescript
// When submitting check-in
const payload = {
  journeyId: 'uuid',
  date: getTodayAsLocalDate(), // '2025-11-15' in user's local timezone
  details: [...]
};
```

**Key Point**: The `date` field is a string in `YYYY-MM-DD` format representing the user's local date.

---

## 3. Backend Implementation

### 3.1 Timestamp Storage

All `timestamptz` columns automatically store in UTC:

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

PostgreSQL handles conversion automatically.

### 3.2 Check-in Date Handling

When receiving check-in:

```typescript
// Backend receives date as string: "2025-11-15"
const checkin = await prisma.checkin.create({
  data: {
    userId,
    journeyId,
    date: new Date(dateString), // Parsed as local date
    ...
  }
});
```

**Important**: The DATE type in PostgreSQL stores date without time, so no timezone conversion issues.

### 3.3 Date Queries

When querying by date range:

```typescript
// Frontend sends: startDate: "2025-11-01", endDate: "2025-11-15"
const checkins = await prisma.checkin.findMany({
  where: {
    userId,
    journeyId,
    date: {
      gte: new Date(startDate),
      lte: new Date(endDate)
    }
  }
});
```

---

## 4. Edge Cases

### 4.1 User Traveling Across Timezones

**Scenario**: User travels from New York to Tokyo

**Behavior**:
- Each check-in is recorded for the local date in the user's current location
- Historical check-ins remain unchanged
- If user checks in at 11 PM in Tokyo (same calendar day as 10 AM in NY), it records for that single local date

**Implementation**: Always use device's current local date at time of check-in.

### 4.2 Daylight Saving Time

**Scenario**: DST transition happens

**Behavior**:
- Frontend: JavaScript automatically handles DST (browser does this)
- Backend: UTC timestamps unaffected
- Check-in dates: No impact (DATE type has no time component)

**No special handling needed** - system naturally handles DST.

### 4.3 Midnight Boundary

**Scenario**: User submits check-in at 11:59 PM local time

**Behavior**:
- Check-in recorded for current local date
- Date determined at moment of frontend submission
- Even if backend receives it a second later (after midnight UTC), the date field is already set

**Implementation**: Frontend sets date before API call:

```typescript
const submitCheckIn = async () => {
  const localDate = getTodayAsLocalDate(); // Captured immediately
  
  const payload = {
    journeyId,
    date: localDate, // Fixed to this moment's local date
    details
  };
  
  await api.post('/checkins', payload);
};
```

---

## 5. Display Examples

### 5.1 Check-in List

```tsx
// Frontend component
<div>
  {checkins.map(checkin => (
    <div key={checkin.id}>
      <span>{formatDateInUserTimezone(checkin.date)}</span>
      <span className="text-muted">
        {formatDateTimeInUserTimezone(checkin.createdAt)}
      </span>
    </div>
  ))}
</div>
```

**Output**:
```
Nov 15, 2025
Created at: 11/15/2025, 2:30 PM
```

### 5.2 Streak Display

Streaks calculated based on consecutive DATE values:

```sql
-- Backend query
WITH daily_checkins AS (
  SELECT date
  FROM checkins
  WHERE user_id = $1 AND journey_id = $2
  ORDER BY date DESC
)
SELECT COUNT(*) AS current_streak
FROM (
  SELECT 
    date,
    date - ROW_NUMBER() OVER (ORDER BY date DESC)::int AS streak_group
  FROM daily_checkins
) sub
WHERE streak_group = (
  SELECT date - 1::int 
  FROM daily_checkins 
  LIMIT 1
);
```

**Behavior**: Streak counts consecutive dates regardless of timezone.

---

## 6. API Date Parameters

### 6.1 Query Parameters

All date parameters use `YYYY-MM-DD` format:

```http
GET /api/checkins?startDate=2025-11-01&endDate=2025-11-15
```

### 6.2 Request Body

```json
{
  "date": "2025-11-15",
  "journeyId": "uuid",
  "details": [...]
}
```

---

## 7. Testing Timezone Handling

### 7.1 Manual Test Cases

1. **Check-in at different times of day**
   - Morning (9 AM) → Should record today's date
   - Night (11 PM) → Should record today's date
   - Just after midnight (12:01 AM) → Should record new day's date

2. **Travel simulation**
   - Change system timezone
   - Submit check-in
   - Verify correct local date recorded

3. **DST transition**
   - Test during DST change weekend
   - Verify no duplicate or missing days

### 7.2 Automated Tests

```typescript
// Frontend test
describe('Date handling', () => {
  it('should use local date for check-in', () => {
    const localDate = getTodayAsLocalDate();
    expect(localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should format date in user timezone', () => {
    const date = new Date('2025-11-15T10:00:00Z');
    const formatted = formatDateInUserTimezone(date);
    expect(formatted).toBeTruthy();
  });
});
```

---

## 8. User Settings

### 8.1 Timezone Preference

Allow users to manually override detected timezone:

```tsx
// Settings page
<select value={userTimezone} onChange={handleTimezoneChange}>
  {Intl.supportedValuesOf('timeZone').map(tz => (
    <option key={tz} value={tz}>{tz}</option>
  ))}
</select>
```

**Storage**: Save to `users.settings.timezone`

**Usage**: Override `Intl.DateTimeFormat().resolvedOptions().timeZone`

---

## 9. Calendar Heatmap Timezone

Calendar heatmap shows dates in user's local timezone:

```typescript
// Generate heatmap data
const heatmapData = checkins.map(c => ({
  date: c.date, // Already a DATE string "2025-11-15"
  score: c.totalScore
}));
```

**Display**: Each square represents a local date, aligned with user's perception of "today", "yesterday", etc.

---

## 10. Simplicity Rules

1. **No complex conversions**: Date string → PostgreSQL DATE → Date string
2. **Frontend responsibility**: Always provide local date
3. **Backend trust**: Accept date as-is (validate format only)
4. **No timezone math**: JavaScript and PostgreSQL handle automatically
5. **Consistency**: All timestamps UTC, all dates local

---

## 11. Documentation for Users

**In-app help text**:

> Check-ins are recorded for your local date. If you travel to a different timezone, each check-in will be recorded for the local date where you are at that moment.

---

## 12. Migration Considerations

If user data exists with incorrect timezone handling:

```sql
-- No migration needed - dates are already stored correctly as DATE type
-- Timestamps are already in UTC

-- If needed, verify data integrity:
SELECT 
  id,
  date,
  created_at,
  created_at AT TIME ZONE 'UTC' AS created_at_utc
FROM checkins
WHERE date != (created_at AT TIME ZONE 'America/New_York')::date
LIMIT 100;
```

---

_Simple timezone strategy: frontend handles local display, backend stores UTC. No complex conversions needed._

