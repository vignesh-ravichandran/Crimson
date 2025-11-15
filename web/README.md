# Crimson Club - Frontend

React PWA for Crimson Club habit tracking application.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file (see `ENV_TEMPLATE.md`):

```bash
VITE_GOOGLE_CLIENT_ID="your_google_client_id"
VITE_API_URL="http://localhost:3000/api"
```

### 3. Start Development Server

```bash
npm run dev
```

App will start at `http://localhost:5173`

## 📚 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## 🏗️ Project Structure

```
web/
├── src/
│   ├── api/              # API client and functions
│   │   ├── client.ts     # Axios instance with interceptors
│   │   └── auth.ts       # Authentication API
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   └── auth/         # Auth-specific components
│   │       └── ProtectedRoute.tsx
│   ├── features/         # Feature modules
│   │   └── auth/
│   │       └── components/
│   │           └── GoogleLoginButton.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useAuth.tsx   # Authentication hook
│   ├── lib/              # Utilities
│   │   └── utils.ts      # Helper functions
│   ├── pages/            # Page components
│   │   ├── HomePage.tsx
│   │   └── LoginPage.tsx
│   ├── styles/
│   │   └── index.css     # Global styles & design tokens
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## 🎨 Design System

### Colors

The app uses CSS variables for theming:

```css
/* Light mode */
--color-background: #FFFFFF
--color-surface: #F7F7F8
--color-text: #111827
--color-primary-500: #DC143C

/* Dark mode */
.dark {
  --color-background: #000000
  --color-surface: #121212
  --color-text: #E5E7EB
}
```

### Components

Pre-built UI components:

```tsx
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>

// Card variants
<Card variant="default">Default</Card>
<Card variant="elevated">Elevated</Card>
<Card variant="bordered">Bordered</Card>
```

## 🔐 Authentication Flow

1. User clicks "Sign in with Google"
2. Google OAuth popup opens
3. User authorizes
4. Frontend receives Google token
5. Frontend sends token to backend (`POST /api/auth/oauth/google`)
6. Backend returns JWT + user data
7. Frontend stores JWT in localStorage
8. User redirected to home page

### Using Auth in Components

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user.displayName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes

```tsx
// Routes that require authentication
<Route element={<ProtectedRoute />}>
  <Route path="/" element={<HomePage />} />
  <Route path="/journeys" element={<JourneysPage />} />
</Route>
```

## 🎯 Development Guidelines

### TypeScript

All code is TypeScript with strict mode enabled:

```tsx
// ✅ Good - typed props
interface Props {
  title: string;
  count: number;
}

function MyComponent({ title, count }: Props) {
  // ...
}

// ❌ Bad - any type
function MyComponent(props: any) {
  // ...
}
```

### Component Structure

```tsx
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Component
export function MyComponent({ title }: Props) {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(c => c + 1)}>
        Increment
      </Button>
    </div>
  );
}
```

### Styling

Use Tailwind CSS classes:

```tsx
<div className="flex items-center gap-4 p-4 bg-surface rounded-lg">
  <h2 className="text-2xl font-bold text-primary-500">Title</h2>
  <p className="text-muted">Description</p>
</div>
```

Use `cn()` utility for conditional classes:

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  isDanger && 'text-danger'
)}>
  Content
</div>
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

Example test:

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## 📱 PWA Features

The app is configured as a Progressive Web App:

- **Installable**: Users can install on home screen
- **Offline**: Service worker caches assets
- **Fast**: Optimized bundle size

### Manifest

Located at `/public/manifest.json` (generated by Vite PWA plugin)

### Service Worker

Automatically generated by Workbox (via Vite PWA plugin)

## 🚀 Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview

# Output in dist/ folder
```

### Production Checklist

- [ ] Update `VITE_API_URL` to production API
- [ ] Update `VITE_GOOGLE_CLIENT_ID` to production client ID
- [ ] Test production build locally
- [ ] Check bundle size (should be < 500KB)
- [ ] Test on real mobile devices
- [ ] Verify PWA installability

## 🌐 Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- iOS Safari: iOS 13+
- Android Chrome: Latest 2 versions

## 🔧 Troubleshooting

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

### OAuth errors

- Verify `VITE_GOOGLE_CLIENT_ID` is set correctly
- Check backend OAuth configuration
- Ensure redirect URI matches in Google Console

### API connection issues

- Verify backend is running (`http://localhost:3000`)
- Check `VITE_API_URL` in `.env`
- Check CORS configuration in backend

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Design Specifications](../design/)

## 🤝 Contributing

See [../CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT

