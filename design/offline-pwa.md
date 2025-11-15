# Offline & PWA Strategy - Crimson Club

Complete Progressive Web App implementation with offline-first check-in capability.

---

## Overview

**Goals**:
1. Installable on mobile home screen
2. Offline check-in capability with background sync
3. Fast load times with asset caching
4. Reliable experience on poor connections

**No push notifications** for MVP (Web Push API deferred to post-MVP)

---

## 1. PWA Manifest

### 1.1 manifest.json

```json
{
  "name": "Crimson Club",
  "short_name": "Crimson Club",
  "description": "Habit and progress tracking through daily check-ins",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#DC143C",
  "orientation": "portrait",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["productivity", "health", "lifestyle"],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1170x2532",
      "type": "image/png"
    },
    {
      "src": "/screenshots/checkin.png",
      "sizes": "1170x2532",
      "type": "image/png"
    }
  ]
}
```

### 1.2 HTML Meta Tags

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  
  <!-- PWA -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#DC143C">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Crimson Club">
  
  <!-- Icons -->
  <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
  
  <!-- Splash Screens (iOS) -->
  <link rel="apple-touch-startup-image" href="/splash/iphone-x.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)">
  
  <title>Crimson Club</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

---

## 2. Service Worker

### 2.1 Service Worker Strategy

Use **Workbox** for simplified service worker management.

**Caching Strategies**:
1. **App Shell**: Cache-first (HTML, CSS, JS)
2. **Images/Assets**: Cache-first with expiration
3. **API Calls**: Network-first with cache fallback
4. **Analytics Data**: Network-first, short TTL cache

### 2.2 Service Worker Implementation

```typescript
// src/service-worker.ts
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { Queue } from 'workbox-background-sync';

// Precache app shell (build process injects manifest)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache static assets (images, fonts)
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// Cache API calls with network-first strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60 // 5 minutes
      })
    ]
  })
);

// Background sync for check-ins
const checkinQueue = new Queue('checkin-queue', {
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        console.log('✅ Synced queued check-in');
      } catch (error) {
        console.error('❌ Sync failed, re-queuing:', error);
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  }
});

// Intercept failed check-in POSTs and queue them
registerRoute(
  ({ url, request }) => url.pathname === '/api/checkins' && request.method === 'POST',
  async ({ event }) => {
    try {
      return await fetch(event.request);
    } catch (error) {
      await checkinQueue.pushRequest({ request: event.request });
      return new Response(
        JSON.stringify({ 
          queued: true, 
          message: 'Check-in queued for sync when online' 
        }),
        { 
          status: 202, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }
);

// Skip waiting and claim clients immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
```

### 2.3 Register Service Worker

```typescript
// src/main.tsx
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // Show update prompt to user
    const shouldUpdate = confirm('New version available. Update now?');
    if (shouldUpdate) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  }
});
```

---

## 3. Offline Check-in Flow

### 3.1 Local Storage Structure

Use **IndexedDB** via localforage for persistence.

```typescript
// src/services/offline-storage.ts
import localforage from 'localforage';

// Configure stores
const drafts = localforage.createInstance({
  name: 'crimson-club',
  storeName: 'checkin-drafts'
});

const queue = localforage.createInstance({
  name: 'crimson-club',
  storeName: 'sync-queue'
});

export interface CheckinDraft {
  journeyId: string;
  date: string;
  details: Array<{
    dimensionId: string;
    effortLevel: number | null;
  }>;
  lastModified: Date;
}

export interface QueuedCheckin {
  id: string;
  clientCheckinId: string;
  payload: any;
  attempts: number;
  createdAt: Date;
}

// Save draft (auto-save on swipe)
export async function saveDraft(
  userId: string,
  journeyId: string,
  date: string,
  data: CheckinDraft
) {
  const key = `${userId}:${journeyId}:${date}`;
  await drafts.setItem(key, {
    ...data,
    lastModified: new Date()
  });
}

// Load draft
export async function loadDraft(
  userId: string,
  journeyId: string,
  date: string
): Promise<CheckinDraft | null> {
  const key = `${userId}:${journeyId}:${date}`;
  return await drafts.getItem<CheckinDraft>(key);
}

// Queue check-in for sync
export async function queueCheckin(payload: any) {
  const id = crypto.randomUUID();
  const queued: QueuedCheckin = {
    id,
    clientCheckinId: payload.clientCheckinId || crypto.randomUUID(),
    payload: {
      ...payload,
      clientCheckinId: payload.clientCheckinId || id
    },
    attempts: 0,
    createdAt: new Date()
  };
  
  await queue.setItem(id, queued);
  return queued;
}

// Get all queued check-ins
export async function getQueuedCheckins(): Promise<QueuedCheckin[]> {
  const keys = await queue.keys();
  const items = await Promise.all(
    keys.map(key => queue.getItem<QueuedCheckin>(key))
  );
  return items.filter(Boolean) as QueuedCheckin[];
}

// Remove from queue after successful sync
export async function dequeueCheckin(id: string) {
  await queue.removeItem(id);
}
```

### 3.2 Offline Check-in Component

```typescript
// src/features/checkin/hooks/useOfflineCheckin.ts
import { useState, useEffect } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { saveDraft, loadDraft, queueCheckin } from '@/services/offline-storage';
import { submitCheckin } from '@/api/checkins';

export function useOfflineCheckin(userId: string, journeyId: string, date: string) {
  const [draft, setDraft] = useState<CheckinDraft | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isOnline = useOnlineStatus();

  // Load draft on mount
  useEffect(() => {
    loadDraft(userId, journeyId, date).then(setDraft);
  }, [userId, journeyId, date]);

  // Auto-save draft on changes
  const updateDraft = async (data: CheckinDraft) => {
    setDraft(data);
    await saveDraft(userId, journeyId, date, data);
  };

  // Submit check-in (online or queue offline)
  const submit = async (data: CheckinDraft) => {
    setIsSubmitting(true);
    
    const payload = {
      journeyId,
      date,
      clientCheckinId: crypto.randomUUID(),
      details: data.details.filter(d => d.effortLevel !== null)
    };

    try {
      if (isOnline) {
        // Attempt direct submission
        const result = await submitCheckin(payload);
        // Clear draft on success
        await saveDraft(userId, journeyId, date, null as any);
        return { success: true, result };
      } else {
        // Queue for background sync
        await queueCheckin(payload);
        return { success: true, queued: true };
      }
    } catch (error) {
      if (!isOnline) {
        // Network error while offline - queue it
        await queueCheckin(payload);
        return { success: true, queued: true };
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    draft,
    updateDraft,
    submit,
    isSubmitting,
    isOnline
  };
}
```

### 3.3 Online Status Hook

```typescript
// src/hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### 3.4 Sync Status UI

```tsx
// src/components/SyncStatusBanner.tsx
import { useEffect, useState } from 'react';
import { getQueuedCheckins } from '@/services/offline-storage';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function SyncStatusBanner() {
  const [queuedCount, setQueuedCount] = useState(0);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    async function updateCount() {
      const queued = await getQueuedCheckins();
      setQueuedCount(queued.length);
    }

    updateCount();
    
    // Poll every 5 seconds
    const interval = setInterval(updateCount, 5000);
    return () => clearInterval(interval);
  }, []);

  if (queuedCount === 0 && isOnline) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-3 text-center text-sm ${
      isOnline ? 'bg-green-600' : 'bg-orange-600'
    } text-white`}>
      {!isOnline && '📡 Offline - Check-ins will sync when online'}
      {isOnline && queuedCount > 0 && `🔄 Syncing ${queuedCount} check-in${queuedCount > 1 ? 's' : ''}...`}
    </div>
  );
}
```

---

## 4. Background Sync

### 4.1 Manual Sync Trigger

```typescript
// src/services/sync.ts
import { getQueuedCheckins, dequeueCheckin } from './offline-storage';
import { submitCheckin } from '@/api/checkins';

export async function syncQueuedCheckins() {
  const queued = await getQueuedCheckins();
  
  console.log(`[Sync] Found ${queued.length} queued check-ins`);

  for (const item of queued) {
    try {
      await submitCheckin(item.payload);
      await dequeueCheckin(item.id);
      console.log(`[Sync] ✅ Synced check-in ${item.id}`);
    } catch (error) {
      console.error(`[Sync] ❌ Failed to sync ${item.id}:`, error);
      // Keep in queue for retry
    }
  }
}

// Trigger sync when app comes online
window.addEventListener('online', () => {
  console.log('[Sync] Online - triggering sync');
  syncQueuedCheckins();
});

// Trigger sync when app regains focus
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && navigator.onLine) {
    console.log('[Sync] App visible and online - triggering sync');
    syncQueuedCheckins();
  }
});
```

---

## 5. Install Prompt

### 5.1 Install Banner Component

```tsx
// src/components/InstallPrompt.tsx
import { useState, useEffect } from 'react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Install prompt outcome: ${outcome}`);
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-surface border border-primary-500 rounded-lg p-4 shadow-lg z-40">
      <div className="flex items-start gap-3">
        <div className="text-2xl">📱</div>
        <div className="flex-1">
          <h4 className="font-bold mb-1">Install Crimson Club</h4>
          <p className="text-sm text-muted mb-3">
            Install the app for quick access and offline support
          </p>
          <div className="flex gap-2">
            <button onClick={handleInstall} className="btn-primary text-sm px-4 py-2">
              Install
            </button>
            <button onClick={handleDismiss} className="btn-secondary text-sm px-4 py-2">
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Cache Management

### 6.1 Clear Old Caches

```typescript
// src/services/cache-manager.ts
export async function clearOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    !name.includes('v1') // Keep only current version
  );

  await Promise.all(
    oldCaches.map(name => caches.delete(name))
  );

  console.log(`Cleared ${oldCaches.length} old caches`);
}
```

### 6.2 Storage Quota Check

```typescript
// src/services/storage-quota.ts
export async function checkStorageQuota() {
  if (!navigator.storage || !navigator.storage.estimate) {
    console.warn('Storage API not supported');
    return null;
  }

  const estimate = await navigator.storage.estimate();
  const percentUsed = ((estimate.usage || 0) / (estimate.quota || 1)) * 100;

  console.log(`Storage: ${(estimate.usage || 0) / 1024 / 1024}MB / ${(estimate.quota || 0) / 1024 / 1024}MB (${percentUsed.toFixed(1)}%)`);

  if (percentUsed > 80) {
    console.warn('⚠️ Storage quota over 80%');
    // Trigger cache cleanup
    await clearOldCaches();
  }

  return { usage: estimate.usage, quota: estimate.quota, percentUsed };
}
```

---

## 7. Vite PWA Plugin Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        // ... manifest config from above
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    })
  ]
});
```

---

## 8. Testing Offline Functionality

### 8.1 Chrome DevTools

1. Open DevTools → Application → Service Workers
2. Check "Offline" to simulate offline mode
3. Test check-in submission (should queue)
4. Uncheck "Offline" and verify sync

### 8.2 Lighthouse PWA Audit

Run Lighthouse audit and ensure:
- ✅ Installable
- ✅ Fast and reliable (works offline)
- ✅ Optimized (good performance scores)

---

## 9. Performance Optimizations

1. **Code Splitting**: Lazy load routes and charts
2. **Image Optimization**: WebP format, responsive images
3. **Bundle Size**: Tree-shaking, minification
4. **Critical CSS**: Inline critical styles
5. **Preconnect**: DNS prefetch for API domain

---

_Complete PWA implementation with offline-first architecture for reliable mobile experience._

