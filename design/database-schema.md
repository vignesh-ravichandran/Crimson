# Database Schema - Crimson Club

Complete PostgreSQL database schema with all tables, relationships, indexes, constraints, and operational considerations.

---

## Schema Overview

**Database**: PostgreSQL 13+  
**Key Type**: UUID v4 for all primary keys  
**Timezone**: All timestamps use `timestamptz` (UTC storage)  
**Naming**: snake_case for tables and columns

---

## Tables

### 1. users

Core user account table.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL CHECK (length(username) >= 3 AND length(username) <= 30),
  email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  password_hash TEXT NULL, -- NULL for OAuth-only users
  avatar_url TEXT,
  display_name TEXT,
  settings JSONB DEFAULT '{
    "sounds": true,
    "haptics": true,
    "theme": "auto",
    "timezone": "UTC"
  }'::jsonb,
  oauth_provider TEXT, -- 'google', 'email', etc.
  oauth_provider_id TEXT, -- provider's user ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_provider_id);

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Settings JSONB Fields**:
- `sounds`: boolean - enable sound effects
- `haptics`: boolean - enable haptic feedback
- `theme`: 'light' | 'dark' | 'auto'
- `timezone`: IANA timezone string (e.g., 'America/New_York')

---

### 2. journeys

Journey (goal tracking container) table.

```sql
CREATE TABLE journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(title) >= 3 AND length(title) <= 100),
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  metadata JSONB DEFAULT '{}'::jsonb, -- for future extensibility
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_journeys_created_by ON journeys(created_by);
CREATE INDEX idx_journeys_is_public ON journeys(is_public) WHERE is_public = true;
CREATE INDEX idx_journeys_status ON journeys(status);
CREATE INDEX idx_journeys_created_at ON journeys(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_journeys_updated_at
  BEFORE UPDATE ON journeys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 3. journey_members

Junction table for users participating in journeys.

```sql
CREATE TABLE journey_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_checkin_at TIMESTAMPTZ,
  
  CONSTRAINT unique_journey_member UNIQUE(journey_id, user_id)
);

-- Indexes
CREATE INDEX idx_journey_members_journey ON journey_members(journey_id);
CREATE INDEX idx_journey_members_user ON journey_members(user_id);
CREATE INDEX idx_journey_members_role ON journey_members(journey_id, role);
```

**Roles**:
- `owner`: Journey creator, full edit permissions
- `admin`: Can edit dimensions (future use)
- `member`: Can check-in and view

---

### 4. dimensions

Tracking dimensions within a journey.

```sql
CREATE TABLE dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 50),
  description TEXT,
  examples JSONB DEFAULT '[]'::jsonb, -- array of example strings
  weight INT NOT NULL DEFAULT 1 CHECK (weight BETWEEN 1 AND 5),
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_dimensions_journey ON dimensions(journey_id, display_order);

-- Trigger for updated_at
CREATE TRIGGER update_dimensions_updated_at
  BEFORE UPDATE ON dimensions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Examples JSONB**: Array of strings, e.g., `["Run 5k", "Cycle 30min", "Swim laps"]`

---

### 5. checkins

Daily check-in records (one per user per journey per day).

```sql
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  date DATE NOT NULL, -- stored as user's date (normalized by timezone at app layer)
  total_score NUMERIC(10,2) NOT NULL DEFAULT 0,
  client_checkin_id UUID, -- for idempotency
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_user_journey_date UNIQUE(user_id, journey_id, date)
);

-- Indexes
CREATE INDEX idx_checkins_user_journey ON checkins(user_id, journey_id, date DESC);
CREATE INDEX idx_checkins_journey_date ON checkins(journey_id, date DESC);
CREATE INDEX idx_checkins_client_id ON checkins(client_checkin_id) WHERE client_checkin_id IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER update_checkins_updated_at
  BEFORE UPDATE ON checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Notes**:
- `date` is stored as DATE type (normalized to user's local date)
- `client_checkin_id` enables idempotent operations for offline sync

---

### 6. checkin_details

Individual dimension efforts within a check-in.

```sql
CREATE TABLE checkin_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id UUID NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
  dimension_id UUID NOT NULL REFERENCES dimensions(id) ON DELETE CASCADE,
  effort_level SMALLINT NOT NULL CHECK (effort_level BETWEEN 1 AND 5),
  score NUMERIC(10,2) NOT NULL, -- computed: dimension.weight * effort_score_mapping[effort_level]
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_checkin_dimension UNIQUE(checkin_id, dimension_id)
);

-- Indexes
CREATE INDEX idx_checkin_details_checkin ON checkin_details(checkin_id);
CREATE INDEX idx_checkin_details_dimension ON checkin_details(dimension_id);
```

**Effort Level Mapping** (applied at application layer):
```
1 → -1.0  (Skipped)
2 → 0.5   (Minimal Effort)
3 → 1.0   (Partial Effort)
4 → 2.0   (Solid Effort)
5 → 3.0   (Crushed It)
```

**Score Calculation**: `score = dimension.weight * effort_score_mapping[effort_level]`

---

### 7. badges

System-defined badge definitions.

```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL, -- e.g., 'streak_7', 'beast_mode'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  criteria JSONB NOT NULL, -- badge earning rules
  icon_url TEXT,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_badges_key ON badges(key);
```

**Criteria JSONB Examples**:
```json
{
  "type": "streak",
  "days": 7
}

{
  "type": "crushed_count",
  "count": 3,
  "period": "week"
}

{
  "type": "improvement",
  "percentage": 20,
  "comparison": "previous_week"
}
```

---

### 8. user_badges

User-earned badges.

```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE, -- NULL for global badges
  awarded_on TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb, -- e.g., {"streak_count": 7, "week": "2025-W46"}
  
  CONSTRAINT unique_user_badge_journey UNIQUE(user_id, badge_id, journey_id)
);

-- Indexes
CREATE INDEX idx_user_badges_user ON user_badges(user_id, awarded_on DESC);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX idx_user_badges_journey ON user_badges(journey_id) WHERE journey_id IS NOT NULL;
```

---

### 9. streaks

Current streak tracking per user per journey.

```sql
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_checkin_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_user_journey_streak UNIQUE(user_id, journey_id)
);

-- Indexes
CREATE INDEX idx_streaks_user_journey ON streaks(user_id, journey_id);
CREATE INDEX idx_streaks_journey_longest ON streaks(journey_id, longest_streak DESC);

-- Trigger for updated_at
CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Streak Rules**:
- A day counts toward streak if user completes check-in (any effort on all required dimensions)
- Consecutive days increment `current_streak`
- Missing a day resets `current_streak` to 0
- `longest_streak` tracks all-time best

---

### 10. journey_invites

Invite tokens for private journeys.

```sql
CREATE TABLE journey_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL, -- secure random token
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_invites_token ON journey_invites(token) WHERE status = 'pending';
CREATE INDEX idx_invites_email ON journey_invites(email, status);
CREATE INDEX idx_invites_journey ON journey_invites(journey_id, status);
```

**Token Generation**: 32-character secure random string, 7-day expiry

---

### 11. leaderboard_cache

Materialized leaderboard data (updated by background job).

```sql
CREATE TABLE leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('week', 'month', 'all_time')),
  period_key TEXT NOT NULL, -- e.g., '2025-W46', '2025-11', 'all'
  total_score NUMERIC(10,2) NOT NULL DEFAULT 0,
  checkin_count INT NOT NULL DEFAULT 0,
  streak_count INT NOT NULL DEFAULT 0,
  completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0, -- percentage
  rank INT,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_leaderboard_entry UNIQUE(journey_id, user_id, period, period_key)
);

-- Indexes
CREATE INDEX idx_leaderboard_journey_period ON leaderboard_cache(journey_id, period, period_key, total_score DESC);
CREATE INDEX idx_leaderboard_rank ON leaderboard_cache(journey_id, period, period_key, rank);
```

**Period Keys**:
- Week: `YYYY-Www` (ISO week, e.g., '2025-W46')
- Month: `YYYY-MM` (e.g., '2025-11')
- All time: `'all'`

---

## Helper Functions

### update_updated_at_column()

Trigger function to automatically update `updated_at` timestamps.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### calculate_checkin_score()

Trigger function to recalculate total score when checkin_details change.

```sql
CREATE OR REPLACE FUNCTION calculate_checkin_score()
RETURNS TRIGGER AS $$
DECLARE
  effort_mapping NUMERIC[] := ARRAY[-1.0, 0.5, 1.0, 2.0, 3.0];
  new_total NUMERIC;
BEGIN
  -- Calculate total score for the checkin
  SELECT COALESCE(SUM(d.weight * effort_mapping[cd.effort_level]), 0)
  INTO new_total
  FROM checkin_details cd
  JOIN dimensions d ON d.id = cd.dimension_id
  WHERE cd.checkin_id = COALESCE(NEW.checkin_id, OLD.checkin_id);
  
  -- Update checkin total_score
  UPDATE checkins
  SET total_score = new_total
  WHERE id = COALESCE(NEW.checkin_id, OLD.checkin_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
CREATE TRIGGER trigger_calculate_checkin_score
  AFTER INSERT OR UPDATE OR DELETE ON checkin_details
  FOR EACH ROW
  EXECUTE FUNCTION calculate_checkin_score();
```

---

## Materialized Views

### journey_stats_summary

Quick stats per journey (refresh periodically or on-demand).

```sql
CREATE MATERIALIZED VIEW journey_stats_summary AS
SELECT 
  j.id AS journey_id,
  COUNT(DISTINCT jm.user_id) AS member_count,
  COUNT(DISTINCT c.id) AS total_checkins,
  COALESCE(AVG(c.total_score), 0) AS avg_score,
  MAX(c.date) AS last_checkin_date
FROM journeys j
LEFT JOIN journey_members jm ON jm.journey_id = j.id
LEFT JOIN checkins c ON c.journey_id = j.id
WHERE j.status = 'active'
GROUP BY j.id;

-- Index
CREATE UNIQUE INDEX idx_journey_stats_id ON journey_stats_summary(journey_id);
```

**Refresh Strategy**: Run `REFRESH MATERIALIZED VIEW CONCURRENTLY journey_stats_summary;` nightly or on significant updates.

---

## Migration Strategy

1. **Initial Schema**: Create all tables in order of dependencies (users → journeys → dimensions, etc.)
2. **Seed Data**: Insert default badges via seed script
3. **Version Control**: Use Prisma migrations or custom SQL migration files with timestamps
4. **Rollback**: Keep DOWN migrations for each schema change

---

## Data Integrity Rules

1. **Cascading Deletes**: User or journey deletion cascades to related records
2. **Soft Deletes**: Journeys use `status = 'deleted'` instead of hard delete for audit trail
3. **Constraints**: Use CHECK constraints for enum-like fields and value ranges
4. **Unique Constraints**: Prevent duplicate checkins per user/journey/day

---

## Backup & Retention

- **Daily automated backups** of full database
- **Point-in-time recovery** enabled (WAL archiving)
- **Retention**: 30 days for daily backups, 1 year for monthly snapshots
- **Test restores** quarterly

---

## Performance Considerations

1. **Indexes**: All foreign keys indexed, common query paths covered
2. **Partitioning**: Consider partitioning `checkins` by date if table grows beyond 10M rows
3. **Archival**: Archive checkins older than 2 years to separate table
4. **Query Optimization**: Use EXPLAIN ANALYZE for slow queries (> 100ms)

---

## Security

- **Row-Level Security**: Consider RLS policies for multi-tenant isolation (future)
- **Prepared Statements**: Always use parameterized queries (ORM handles this)
- **Encryption**: Enable encryption at rest for managed PostgreSQL
- **Access Control**: Least-privilege database users for app vs admin

---

## Connection Pooling

- **PgBouncer** or built-in ORM pooling
- **Pool size**: 10-20 connections per app instance
- **Timeout**: 30 seconds for idle connections

---

## Monitoring

- **Metrics to track**:
  - Connection pool usage
  - Query latency (p50, p95, p99)
  - Table sizes and growth rate
  - Index usage statistics
- **Alerts**:
  - Connection pool exhaustion
  - Slow queries (> 1s)
  - Replication lag (if using replicas)

---

## Example Queries

### Get leaderboard for a journey (week)

```sql
SELECT 
  lc.rank,
  u.username,
  u.avatar_url,
  lc.total_score,
  lc.streak_count,
  lc.completion_rate
FROM leaderboard_cache lc
JOIN users u ON u.id = lc.user_id
WHERE lc.journey_id = $1
  AND lc.period = 'week'
  AND lc.period_key = $2
ORDER BY lc.rank ASC
LIMIT 50;
```

### Get user's check-in history for analytics

```sql
SELECT 
  c.date,
  c.total_score,
  json_agg(
    json_build_object(
      'dimension_name', d.name,
      'effort_level', cd.effort_level,
      'score', cd.score
    )
  ) AS dimension_details
FROM checkins c
JOIN checkin_details cd ON cd.checkin_id = c.id
JOIN dimensions d ON d.id = cd.dimension_id
WHERE c.user_id = $1
  AND c.journey_id = $2
  AND c.date BETWEEN $3 AND $4
GROUP BY c.id, c.date, c.total_score
ORDER BY c.date DESC;
```

### Calculate current streak

```sql
WITH daily_checkins AS (
  SELECT date
  FROM checkins
  WHERE user_id = $1 AND journey_id = $2
  ORDER BY date DESC
),
streak_calc AS (
  SELECT 
    date,
    date - ROW_NUMBER() OVER (ORDER BY date DESC)::int AS streak_group
  FROM daily_checkins
)
SELECT COUNT(*) AS current_streak
FROM streak_calc
WHERE streak_group = (SELECT streak_group FROM streak_calc LIMIT 1);
```

---

_This schema supports MVP and scales to 100K+ users and millions of check-ins._

