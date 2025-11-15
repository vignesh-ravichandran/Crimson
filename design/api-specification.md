# API Specification - Crimson Club

Complete REST API documentation for all endpoints with request/response examples.

---

## API Design Principles

1. **RESTful**: Standard HTTP methods (GET, POST, PUT, DELETE)
2. **JSON-only**: All requests and responses use JSON
3. **Consistent envelope**: Standard response format
4. **No versioning for MVP**: URLs use `/api/` prefix (not `/api/v1/` to keep simple)
5. **Authentication**: JWT bearer tokens in Authorization header
6. **Error handling**: Consistent error response format

---

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.crimsonclub.app/api
```

---

## Authentication

All authenticated endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## Response Format

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-15T10:30:00Z",
    "pagination": { ... } // if paginated
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": [
      {
        "field": "email",
        "message": "Email must be valid"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-11-15T10:30:00Z"
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate or concurrent modification |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## 1. Authentication Endpoints

### 1.1 OAuth Login (Google)

```http
POST /api/auth/oauth/google
Content-Type: application/json

{
  "token": "google_oauth_token_here"
}
```

**Response 200**:
```json
{
  "data": {
    "accessToken": "jwt_token_here",
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "displayName": "John Doe",
      "avatarUrl": "https://...",
      "settings": {
        "sounds": true,
        "haptics": true,
        "theme": "auto"
      }
    }
  }
}
```

**Errors**:
- `401`: Invalid OAuth token
- `500`: Failed to create user

---

### 1.2 Get Current User

```http
GET /api/users/me
Authorization: Bearer <token>
```

**Response 200**:
```json
{
  "data": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "avatarUrl": "https://...",
    "settings": {
      "sounds": true,
      "haptics": true,
      "theme": "auto",
      "timezone": "America/New_York"
    },
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

---

### 1.3 Update User Settings

```http
PATCH /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "settings": {
    "sounds": false,
    "theme": "dark"
  }
}
```

**Response 200**: Returns updated user object

---

## 2. Journey Endpoints

### 2.1 Create Journey

```http
POST /api/journeys
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "30-Day Fitness Challenge",
  "description": "Track daily fitness habits",
  "isPublic": true,
  "dimensions": [
    {
      "name": "Cardio",
      "description": "Cardiovascular exercises",
      "examples": ["Run 5k", "Cycle 30min", "Swim laps"],
      "weight": 3,
      "displayOrder": 0
    },
    {
      "name": "Strength",
      "description": "Resistance training",
      "examples": ["Push-ups", "Weight lifting"],
      "weight": 2,
      "displayOrder": 1
    }
  ]
}
```

**Response 201**:
```json
{
  "data": {
    "id": "journey-uuid",
    "title": "30-Day Fitness Challenge",
    "description": "Track daily fitness habits",
    "isPublic": true,
    "status": "active",
    "createdBy": "user-uuid",
    "dimensions": [
      {
        "id": "dim-uuid-1",
        "name": "Cardio",
        "description": "Cardiovascular exercises",
        "examples": ["Run 5k", "Cycle 30min", "Swim laps"],
        "weight": 3,
        "displayOrder": 0
      }
    ],
    "memberCount": 1,
    "createdAt": "2025-11-15T10:00:00Z"
  }
}
```

**Validation**:
- `title`: 3-100 characters, required
- `dimensions`: At least 1 required
- `weight`: 1-5, required
- `isPublic`: boolean, default false

**Errors**:
- `400`: Validation error
- `401`: Not authenticated

---

### 2.2 Get All Journeys

```http
GET /api/journeys?page=1&limit=20&isPublic=true&q=fitness
Authorization: Bearer <token>
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `isPublic`: Filter by visibility (optional)
- `q`: Search query for title/description (optional)

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "30-Day Fitness Challenge",
      "description": "...",
      "isPublic": true,
      "status": "active",
      "createdBy": {
        "id": "user-uuid",
        "username": "john_doe",
        "displayName": "John Doe"
      },
      "memberCount": 24,
      "dimensionCount": 3,
      "createdAt": "2025-11-01T00:00:00Z",
      "userIsMember": false,
      "userRole": null
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 5,
      "totalItems": 94
    }
  }
}
```

---

### 2.3 Get Journey Details

```http
GET /api/journeys/:journeyId
Authorization: Bearer <token>
```

**Response 200**:
```json
{
  "data": {
    "id": "uuid",
    "title": "30-Day Fitness Challenge",
    "description": "...",
    "isPublic": true,
    "status": "active",
    "createdBy": {
      "id": "user-uuid",
      "username": "john_doe",
      "displayName": "John Doe",
      "avatarUrl": "..."
    },
    "dimensions": [
      {
        "id": "dim-uuid",
        "name": "Cardio",
        "description": "...",
        "examples": ["Run", "Bike"],
        "weight": 3,
        "displayOrder": 0
      }
    ],
    "memberCount": 24,
    "stats": {
      "totalCheckins": 340,
      "avgScore": 18.5,
      "lastCheckinDate": "2025-11-15"
    },
    "userMembership": {
      "isMember": true,
      "role": "owner",
      "joinedAt": "2025-11-01T00:00:00Z"
    },
    "createdAt": "2025-11-01T00:00:00Z"
  }
}
```

**Errors**:
- `404`: Journey not found
- `403`: Private journey, user not a member

---

### 2.4 Update Journey

```http
PUT /api/journeys/:journeyId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "dimensions": [
    {
      "id": "existing-dim-uuid",
      "name": "Cardio",
      "weight": 4
    },
    {
      "name": "New Dimension",
      "weight": 2,
      "displayOrder": 2
    }
  ]
}
```

**Response 200**: Returns updated journey object

**Permissions**: Only journey owner can update

**Errors**:
- `403`: Not the owner
- `400`: Validation error

---

### 2.5 Join Journey

```http
POST /api/journeys/:journeyId/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "inviteToken": "optional-for-private-journeys"
}
```

**Response 201**:
```json
{
  "data": {
    "journeyId": "uuid",
    "userId": "uuid",
    "role": "member",
    "joinedAt": "2025-11-15T10:00:00Z"
  }
}
```

**Errors**:
- `400`: Already a member
- `403`: Private journey requires valid invite token
- `404`: Journey not found

---

### 2.6 Leave Journey

```http
DELETE /api/journeys/:journeyId/members/me
Authorization: Bearer <token>
```

**Response 204**: No content

**Note**: Owner cannot leave without transferring ownership first

---

### 2.7 Send Invite (Private Journey)

```http
POST /api/journeys/:journeyId/invites
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "friend@example.com"
}
```

**Response 201**:
```json
{
  "data": {
    "id": "invite-uuid",
    "journeyId": "uuid",
    "email": "friend@example.com",
    "token": "secure-random-token",
    "expiresAt": "2025-11-22T10:00:00Z",
    "status": "pending"
  }
}
```

**Permissions**: Owner only

---

## 3. Check-in Endpoints

### 3.1 Create/Update Check-in

```http
POST /api/checkins
Authorization: Bearer <token>
Content-Type: application/json

{
  "journeyId": "journey-uuid",
  "date": "2025-11-15",
  "clientCheckinId": "client-generated-uuid",
  "details": [
    {
      "dimensionId": "dim-uuid-1",
      "effortLevel": 5
    },
    {
      "dimensionId": "dim-uuid-2",
      "effortLevel": 3
    }
  ]
}
```

**Response 201** (if new) or **200** (if updated):
```json
{
  "data": {
    "id": "checkin-uuid",
    "userId": "user-uuid",
    "journeyId": "journey-uuid",
    "date": "2025-11-15",
    "totalScore": 12,
    "details": [
      {
        "dimensionId": "dim-uuid-1",
        "dimensionName": "Cardio",
        "effortLevel": 5,
        "score": 9
      },
      {
        "dimensionId": "dim-uuid-2",
        "dimensionName": "Strength",
        "effortLevel": 3,
        "score": 3
      }
    ],
    "createdAt": "2025-11-15T10:00:00Z",
    "streak": {
      "current": 7,
      "longest": 12
    },
    "badgesEarned": [
      {
        "id": "badge-uuid",
        "key": "streak_7",
        "name": "Week Warrior",
        "description": "One full week of consistency!"
      }
    ]
  }
}
```

**Validation**:
- `date`: Must be within last 7 days
- `effortLevel`: 1-5 required for each dimension
- `clientCheckinId`: For idempotency (prevents duplicates on retry)

**Errors**:
- `400`: Invalid date or effort levels
- `403`: Not a member of journey
- `409`: Duplicate `clientCheckinId`

---

### 3.2 Get Check-ins

```http
GET /api/checkins?journeyId={id}&userId={id}&startDate={date}&endDate={date}
Authorization: Bearer <token>
```

**Query Parameters**:
- `journeyId`: Required
- `userId`: Optional (defaults to current user)
- `startDate`: Optional (ISO date)
- `endDate`: Optional (ISO date)

**Response 200**:
```json
{
  "data": [
    {
      "id": "checkin-uuid",
      "userId": "user-uuid",
      "journeyId": "journey-uuid",
      "date": "2025-11-15",
      "totalScore": 12,
      "details": [
        {
          "dimensionId": "dim-uuid",
          "dimensionName": "Cardio",
          "effortLevel": 5,
          "score": 9
        }
      ]
    }
  ]
}
```

---

## 4. Analytics Endpoints

### 4.1 Get Radar Chart Data

```http
GET /api/journeys/:journeyId/analytics/radar?userId={id}&startDate={date}&endDate={date}
Authorization: Bearer <token>
```

**Response 200**: See charts-analytics.md for full format

---

### 4.2 Get Stacked Bar Data

```http
GET /api/journeys/:journeyId/analytics/stacked-bar?userId={id}&startDate={date}&endDate={date}
Authorization: Bearer <token>
```

**Response 200**: See charts-analytics.md

---

### 4.3 Get Line Chart Data

```http
GET /api/journeys/:journeyId/analytics/line?userId={id}&startDate={date}&endDate={date}&includeMA=true
Authorization: Bearer <token>
```

**Response 200**: See charts-analytics.md

---

### 4.4 Get Heatmap Data

```http
GET /api/journeys/:journeyId/analytics/heatmap?userId={id}&startDate={date}&endDate={date}
Authorization: Bearer <token>
```

**Response 200**: See charts-analytics.md

---

### 4.5 Get Dimension Trends

```http
GET /api/journeys/:journeyId/analytics/radar-over-time?userId={id}&weeks={number}
Authorization: Bearer <token>
```

**Response 200**: See charts-analytics.md

---

### 4.6 Get Week Comparison

```http
GET /api/journeys/:journeyId/analytics/comparison?userId={id}
Authorization: Bearer <token>
```

**Response 200**: See charts-analytics.md

---

## 5. Leaderboard Endpoints

### 5.1 Get Journey Leaderboard

```http
GET /api/journeys/:journeyId/leaderboard?period=week&sort=score&page=1&limit=50
Authorization: Bearer <token>
```

**Query Parameters**:
- `period`: `week`, `month`, `all_time` (default: week)
- `sort`: `score`, `streak`, `completion` (default: score)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response 200**:
```json
{
  "data": {
    "entries": [
      {
        "rank": 1,
        "user": {
          "id": "user-uuid",
          "username": "john_doe",
          "displayName": "John Doe",
          "avatarUrl": "..."
        },
        "totalScore": 245,
        "checkinCount": 7,
        "streakCount": 7,
        "completionRate": 100
      }
    ],
    "currentUser": {
      "rank": 5,
      "totalScore": 180,
      "streakCount": 5
    },
    "periodInfo": {
      "period": "week",
      "periodKey": "2025-W46",
      "startDate": "2025-11-11",
      "endDate": "2025-11-17"
    }
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 50,
      "totalPages": 1,
      "totalItems": 24
    }
  }
}
```

---

## 6. Gamification Endpoints

### 6.1 Get User Badges

```http
GET /api/users/:userId/badges?journeyId={optional}
Authorization: Bearer <token>
```

**Response 200**:
```json
{
  "data": [
    {
      "id": "user-badge-uuid",
      "badge": {
        "id": "badge-uuid",
        "key": "streak_7",
        "name": "Week Warrior",
        "description": "One full week of consistency!",
        "iconUrl": "/assets/badges/streak-7.svg",
        "tier": "silver"
      },
      "journeyId": "journey-uuid",
      "journeyTitle": "30-Day Fitness",
      "awardedOn": "2025-11-15T10:00:00Z",
      "metadata": {
        "streak_count": 7,
        "week": "2025-W46"
      }
    }
  ]
}
```

---

### 6.2 Get All Badge Definitions

```http
GET /api/badges
```

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "key": "streak_7",
      "name": "Week Warrior",
      "description": "One full week of consistency!",
      "criteria": {
        "type": "streak",
        "days": 7
      },
      "iconUrl": "/assets/badges/streak-7.svg",
      "tier": "silver"
    }
  ]
}
```

---

### 6.3 Get User Streaks

```http
GET /api/users/:userId/streaks?journeyId={optional}
Authorization: Bearer <token>
```

**Response 200**:
```json
{
  "data": [
    {
      "journeyId": "uuid",
      "journeyTitle": "30-Day Fitness",
      "currentStreak": 7,
      "longestStreak": 12,
      "lastCheckinDate": "2025-11-15"
    }
  ]
}
```

---

## 7. Rate Limiting

**Limits**:
- Anonymous: 100 requests/hour
- Authenticated: 1000 requests/hour
- Check-in creation: 100/hour per user

**Rate Limit Headers**:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1700000000
```

**429 Response**:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 3600
  }
}
```

---

## 8. Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Duplicate or concurrent modification |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

---

## 9. Pagination

All list endpoints support pagination:

**Request**:
```http
GET /api/journeys?page=2&limit=20
```

**Response**:
```json
{
  "data": [...],
  "meta": {
    "pagination": {
      "page": 2,
      "limit": 20,
      "totalPages": 5,
      "totalItems": 94,
      "hasNextPage": true,
      "hasPreviousPage": true
    }
  }
}
```

---

## 10. Idempotency

Check-in creation supports idempotency via `clientCheckinId`:

```json
{
  "clientCheckinId": "client-generated-uuid",
  ...
}
```

If the same `clientCheckinId` is submitted multiple times, the server returns the existing check-in (200) instead of creating a duplicate.

---

## 11. CORS Configuration

**Allowed Origins**:
- Development: `http://localhost:5173`, `http://localhost:3000`
- Production: `https://app.crimsonclub.app`

**Allowed Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS

**Allowed Headers**: Authorization, Content-Type

---

## 12. Health Check

```http
GET /api/health
```

**Response 200**:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-11-15T10:00:00Z",
  "services": {
    "database": "healthy",
    "cache": "healthy"
  }
}
```

---

_Complete API specification ready for implementation and frontend integration._

