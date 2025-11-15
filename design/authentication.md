# Authentication & Authorization - Crimson Club

Complete authentication flow using Google OAuth and JWT tokens.

---

## Overview

**Authentication Method**: Google OAuth 2.0  
**Session Management**: JWT (JSON Web Tokens)  
**Token Storage**: Local storage (access token), HTTP-only cookie (refresh token - future)  
**No versioning** for MVP - keep simple

---

## 1. Authentication Flow

### 1.1 Google OAuth Flow

```
User → Click "Sign in with Google"
     → Redirect to Google OAuth consent screen
     → User authorizes
     → Google redirects back with authorization code
     → Frontend exchanges code for Google tokens
     → Frontend sends Google ID token to backend
     → Backend verifies token with Google
     → Backend creates/updates user record
     → Backend returns JWT access token
     → Frontend stores token and redirects to app
```

### 1.2 Sequence Diagram

```
┌──────┐         ┌──────────┐         ┌─────────┐         ┌────────┐
│ User │         │ Frontend │         │ Backend │         │ Google │
└──┬───┘         └────┬─────┘         └────┬────┘         └────┬───┘
   │                  │                    │                   │
   │ Click Sign In    │                    │                   │
   ├─────────────────>│                    │                   │
   │                  │                    │                   │
   │                  │ Redirect to OAuth  │                   │
   │                  ├───────────────────────────────────────>│
   │                  │                    │                   │
   │                  │          User authorizes app           │
   │<─────────────────┤                    │                   │
   │                  │                    │                   │
   │                  │ POST /auth/oauth/google                │
   │                  │     with ID token  │                   │
   │                  ├───────────────────>│                   │
   │                  │                    │                   │
   │                  │                    │ Verify token      │
   │                  │                    ├──────────────────>│
   │                  │                    │<──────────────────┤
   │                  │                    │ Token valid       │
   │                  │                    │                   │
   │                  │                    │ Create/update user│
   │                  │                    │ Generate JWT      │
   │                  │                    │                   │
   │                  │  Return JWT + user │                   │
   │                  │<───────────────────┤                   │
   │                  │                    │                   │
   │                  │ Store token        │                   │
   │                  │ Redirect to app    │                   │
   │<─────────────────┤                    │                   │
   │                  │                    │                   │
```

---

## 2. Frontend Implementation

### 2.1 Google OAuth Button

```tsx
// src/features/auth/components/GoogleLoginButton.tsx
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '@/api/auth';
import { Button } from '@/components/ui/Button';

export function GoogleLoginButton() {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Exchange Google token for our JWT
        const { accessToken, user } = await loginWithGoogle(tokenResponse.access_token);
        
        // Store token
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect to home
        navigate('/');
      } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed. Please try again.');
      }
    },
    onError: () => {
      alert('Login failed. Please try again.');
    }
  });

  return (
    <Button onClick={() => login()} variant="primary" size="lg" className="w-full">
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        {/* Google logo SVG */}
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </Button>
  );
}
```

### 2.2 Auth Provider Setup

```tsx
// src/App.tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* Rest of app */}
    </GoogleOAuthProvider>
  );
}
```

### 2.3 API Client with Auth

```typescript
// src/api/client.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2.4 Auth API Functions

```typescript
// src/api/auth.ts
import { apiClient } from './client';

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    settings: Record<string, any>;
  };
}

export async function loginWithGoogle(googleAccessToken: string): Promise<LoginResponse> {
  const response = await apiClient.post('/auth/oauth/google', {
    token: googleAccessToken
  });
  return response.data.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get('/users/me');
  return response.data.data;
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
```

### 2.5 Protected Route Component

```tsx
// src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
    </div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
```

### 2.6 Auth Hook

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/api/auth';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const cachedUser = localStorage.getItem('user');

    if (token && cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }

    // Verify token is still valid
    if (token) {
      getCurrentUser()
        .then(userData => {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading
  };
}
```

---

## 3. Backend Implementation

### 3.1 OAuth Endpoint

```typescript
// src/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function googleOAuthLogin(req: Request, res: Response) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Token is required'
        }
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token'
        }
      });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { oauthProviderId: googleId }
        ]
      }
    });

    if (!user) {
      // Create new user
      const username = email!.split('@')[0] + '_' + Math.random().toString(36).substr(2, 6);
      
      user = await prisma.user.create({
        data: {
          email: email!,
          username,
          displayName: name || username,
          avatarUrl: picture,
          oauthProvider: 'google',
          oauthProviderId: googleId
        }
      });
    } else if (!user.oauthProviderId) {
      // Link OAuth to existing email user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          oauthProvider: 'google',
          oauthProviderId: googleId,
          avatarUrl: picture || user.avatarUrl
        }
      });
    }

    // Generate JWT
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Update last seen
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() }
    });

    return res.json({
      data: {
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          settings: user.settings
        }
      }
    });
  } catch (error) {
    console.error('OAuth error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication failed'
      }
    });
  }
}
```

### 3.2 JWT Middleware

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided'
        }
      });
    }

    const token = authHeader.substring(7);

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      email: string;
      username: string;
    };

    // Optional: Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub }
    });

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found'
        }
      });
    }

    // Attach user to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      username: decoded.username
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token'
        }
      });
    }

    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication failed'
      }
    });
  }
}
```

### 3.3 Auth Routes

```typescript
// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { googleOAuthLogin } from './auth.controller';

const router = Router();

router.post('/oauth/google', googleOAuthLogin);

export default router;
```

---

## 4. Environment Variables

### 4.1 Frontend (.env)

```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_URL=http://localhost:3000/api
```

### 4.2 Backend (.env)

```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
JWT_SECRET=your_jwt_secret_here_min_32_chars
DATABASE_URL=postgresql://user:pass@localhost:5432/crimson_club
```

---

## 5. Security Considerations

### 5.1 JWT Security

- Use strong secret (min 32 characters, random)
- Set reasonable expiry (7 days for MVP)
- Consider refresh tokens for production (future)
- Never expose JWT_SECRET in client-side code

### 5.2 OAuth Security

- Verify Google tokens on backend (never trust client)
- Use HTTPS in production
- Validate redirect URLs
- Store client secret securely (env vars)

### 5.3 CORS Configuration

```typescript
// src/main.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://app.crimsonclub.app'
    : 'http://localhost:5173',
  credentials: true
}));
```

---

## 6. Testing

### 6.1 Manual Testing

1. Click "Sign in with Google"
2. Authorize app
3. Verify redirect to home
4. Verify token stored
5. Refresh page - should stay logged in
6. Clear token - should redirect to login
7. Try accessing protected route without token

### 6.2 Integration Test

```typescript
// src/tests/auth.test.ts
import request from 'supertest';
import app from '../app';

describe('Auth Flow', () => {
  it('should return 401 without token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .expect(401);

    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return user with valid token', async () => {
    // Mock JWT for testing
    const token = 'valid_jwt_token';

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('email');
  });
});
```

---

## 7. Future Enhancements (Post-MVP)

- **Refresh Tokens**: HTTP-only cookies for better security
- **Email/Password Auth**: Alternative to OAuth
- **2FA**: Two-factor authentication
- **Session Management**: View and revoke active sessions
- **Social Login**: Add GitHub, Apple sign-in

---

_Simple, secure Google OAuth authentication ready for MVP deployment._

