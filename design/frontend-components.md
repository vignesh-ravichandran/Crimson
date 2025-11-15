# Frontend Components & UI System - Crimson Club

Complete component library, design tokens, and UI implementation guide.

---

## 1. Design Tokens

### 1.1 Color Tokens

```typescript
// src/styles/tokens.ts
export const colors = {
  // Light theme
  light: {
    background: '#FFFFFF',
    surface: '#F7F7F8',
    surfaceHover: '#EEEEEF',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    
    primary: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      300: '#FCA5A5',
      500: '#DC143C',
      700: '#CD5C5C',
      900: '#7F1D1D'
    },
    
    accent: {
      800: '#8B0000',
      900: '#650000'
    },
    
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6'
  },
  
  // Dark theme
  dark: {
    background: '#000000',
    surface: '#121212',
    surfaceHover: '#1F1F1F',
    text: '#E5E7EB',
    textMuted: '#9CA3AF',
    border: '#374151',
    
    primary: {
      50: '#7F1D1D',
      100: '#8B0000',
      300: '#B22222',
      500: '#DC143C',
      700: '#EF4444',
      900: '#FCA5A5'
    },
    
    accent: {
      800: '#8B0000',
      900: '#B22222'
    },
    
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6'
  }
};
```

### 1.2 Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-hover': 'var(--color-surface-hover)',
        text: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        border: 'var(--color-border)',
        
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          300: 'var(--color-primary-300)',
          500: 'var(--color-primary-500)',
          700: 'var(--color-primary-700)',
          900: 'var(--color-primary-900)'
        },
        
        accent: {
          800: 'var(--color-accent-800)',
          900: 'var(--color-accent-900)'
        }
      },
      
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)'
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }]
      },
      
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px'
      },
      
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }
    }
  },
  plugins: []
};
```

### 1.3 CSS Variables

```css
/* src/styles/variables.css */
:root {
  --color-background: #FFFFFF;
  --color-surface: #F7F7F8;
  --color-surface-hover: #EEEEEF;
  --color-text: #111827;
  --color-text-muted: #6B7280;
  --color-border: #E5E7EB;
  
  --color-primary-50: #FEF2F2;
  --color-primary-100: #FEE2E2;
  --color-primary-300: #FCA5A5;
  --color-primary-500: #DC143C;
  --color-primary-700: #CD5C5C;
  --color-primary-900: #7F1D1D;
  
  --color-accent-800: #8B0000;
  --color-accent-900: #650000;
}

.dark {
  --color-background: #000000;
  --color-surface: #121212;
  --color-surface-hover: #1F1F1F;
  --color-text: #E5E7EB;
  --color-text-muted: #9CA3AF;
  --color-border: #374151;
  
  --color-primary-50: #7F1D1D;
  --color-primary-100: #8B0000;
  --color-primary-300: #B22222;
  --color-primary-500: #DC143C;
  --color-primary-700: #EF4444;
  --color-primary-900: #FCA5A5;
}
```

---

## 2. Core Components

### 2.1 Button Component

```tsx
// src/components/ui/Button.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-primary-500 text-white hover:bg-primary-700 active:bg-primary-900',
      secondary: 'bg-surface text-text border border-border hover:bg-surface-hover',
      ghost: 'text-primary-500 hover:bg-surface',
      danger: 'bg-danger text-white hover:bg-red-600'
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 2.2 Card Component

```tsx
// src/components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    const variants = {
      default: 'bg-surface',
      elevated: 'bg-surface shadow-elevated',
      bordered: 'bg-surface border border-border'
    };
    
    return (
      <div
        ref={ref}
        className={cn('rounded-lg p-4', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
```

### 2.3 Modal Component

```tsx
// src/components/ui/Modal.tsx
import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showClose?: boolean;
}

export function Modal({ open, onClose, children, size = 'md', showClose = true }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    full: 'max-w-full mx-4'
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn('relative bg-surface rounded-xl shadow-elevated w-full', sizes[size])}>
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted hover:text-text transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {children}
      </div>
    </div>,
    document.body
  );
}
```

### 2.4 Bottom Navigation

```tsx
// src/components/navigation/BottomNav.tsx
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  icon: ReactNode;
  label: string;
  isPrimary?: boolean;
}

export function BottomNav() {
  const navItems: NavItem[] = [
    {
      to: '/',
      icon: <HomeIcon />,
      label: 'Home'
    },
    {
      to: '/journeys',
      icon: <JourneysIcon />,
      label: 'Journeys'
    },
    {
      to: '/checkin',
      icon: <CheckIcon />,
      label: 'Check-In',
      isPrimary: true
    },
    {
      to: '/stats',
      icon: <ChartIcon />,
      label: 'Stats'
    },
    {
      to: '/profile',
      icon: <UserIcon />,
      label: 'Profile'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border pb-safe-bottom z-40">
      <div className="flex items-center justify-around h-16">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors min-w-[60px]',
              item.isPrimary && 'relative -top-4',
              isActive ? 'text-primary-500' : 'text-muted hover:text-text'
            )}
          >
            {({ isActive }) => (
              <>
                {item.isPrimary ? (
                  <div className={cn(
                    'flex items-center justify-center w-14 h-14 rounded-full shadow-elevated',
                    isActive ? 'bg-primary-500 text-white' : 'bg-surface text-primary-500'
                  )}>
                    {item.icon}
                  </div>
                ) : (
                  <div className="w-6 h-6">
                    {item.icon}
                  </div>
                )}
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
```

---

## 3. Check-in Components

### 3.1 SwipeCard Component

```tsx
// src/features/checkin/components/SwipeCard.tsx
import { useState, useRef, TouchEvent } from 'react';
import { cn } from '@/lib/utils';

interface SwipeCardProps {
  dimensionId: string;
  dimensionName: string;
  description?: string;
  examples?: string[];
  weight: number;
  selectedEffort: number | null;
  onSelect: (effort: number) => void;
}

const EFFORT_LABELS = [
  { level: 1, label: 'Skipped', emoji: '❌', color: 'text-red-500' },
  { level: 2, label: 'Minimal', emoji: '😐', color: 'text-orange-400' },
  { level: 3, label: 'Partial', emoji: '😊', color: 'text-yellow-400' },
  { level: 4, label: 'Solid', emoji: '💪', color: 'text-green-500' },
  { level: 5, label: 'Crushed It!', emoji: '🔥', color: 'text-primary-500' }
];

export function SwipeCard({
  dimensionName,
  description,
  examples,
  weight,
  selectedEffort,
  onSelect
}: SwipeCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    setSwipeOffset(diff);
  };

  const handleTouchEnd = () => {
    const threshold = 50;
    
    if (Math.abs(swipeOffset) > threshold) {
      const direction = swipeOffset > 0 ? 1 : -1;
      const currentLevel = selectedEffort || 3;
      const newLevel = Math.max(1, Math.min(5, currentLevel + direction));
      onSelect(newLevel);
    }
    
    setSwipeOffset(0);
  };

  const selectedLabel = EFFORT_LABELS.find(e => e.level === selectedEffort);

  return (
    <div
      className="w-full h-full bg-surface rounded-2xl p-6 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${swipeOffset * 0.2}px)`,
        transition: swipeOffset === 0 ? 'transform 0.3s ease' : 'none'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold">{dimensionName}</h3>
          {description && (
            <p className="text-sm text-muted mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Weight</span>
          <span className="px-2 py-1 bg-primary-500/20 text-primary-500 rounded text-sm font-bold">
            {weight}
          </span>
        </div>
      </div>

      {/* Examples */}
      {examples && examples.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-muted mb-2">Examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, i) => (
              <span key={i} className="px-2 py-1 bg-surface-hover rounded text-sm">
                {example}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Selected Effort Display */}
      {selectedLabel && (
        <div className="text-center mb-6">
          <div className={cn('text-6xl mb-2', selectedLabel.color)}>
            {selectedLabel.emoji}
          </div>
          <p className={cn('text-xl font-bold', selectedLabel.color)}>
            {selectedLabel.label}
          </p>
        </div>
      )}

      {/* Effort Selector */}
      <div className="grid grid-cols-5 gap-2">
        {EFFORT_LABELS.map(effort => (
          <button
            key={effort.level}
            onClick={() => onSelect(effort.level)}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-lg transition-all',
              'border-2',
              selectedEffort === effort.level
                ? 'border-primary-500 bg-primary-500/10 scale-105'
                : 'border-border hover:border-primary-500/50 hover:bg-surface-hover'
            )}
          >
            <span className="text-2xl mb-1">{effort.emoji}</span>
            <span className="text-xs text-center font-medium">
              {effort.label}
            </span>
          </button>
        ))}
      </div>

      {/* Swipe Hint */}
      <p className="text-center text-xs text-muted mt-4">
        Tap to select or swipe left/right
      </p>
    </div>
  );
}
```

### 3.2 Date Pill Selector

```tsx
// src/features/checkin/components/DatePillSelector.tsx
import { cn } from '@/lib/utils';

interface DatePillSelectorProps {
  dates: Date[];
  selected: Date;
  onSelect: (date: Date) => void;
}

export function DatePillSelector({ dates, selected, onSelect }: DatePillSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {dates.map(date => {
        const isSelected = date.toDateString() === selected.toDateString();
        const isToday = date.toDateString() === new Date().toDateString();
        
        return (
          <button
            key={date.toISOString()}
            onClick={() => onSelect(date)}
            className={cn(
              'flex flex-col items-center justify-center min-w-[60px] px-3 py-2 rounded-lg transition-all',
              isSelected
                ? 'bg-primary-500 text-white scale-105'
                : 'bg-surface hover:bg-surface-hover'
            )}
          >
            <span className="text-xs font-medium mb-1">
              {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
            <span className="text-lg font-bold">
              {date.getDate()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

---

## 4. Utility Functions

### 4.1 Class Name Helper

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 4.2 Date Formatting

```typescript
// src/lib/date-utils.ts
export function formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'relative') {
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString();
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  return d.toLocaleDateString();
}

export function getLast7Days(): Date[] {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}
```

---

## 5. Loading States

### 5.1 Skeleton Components

```tsx
// src/components/ui/Skeleton.tsx
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-surface-hover rounded', className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
```

---

## 6. Theme Provider

```tsx
// src/providers/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let resolved: 'light' | 'dark';
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      resolved = systemTheme;
    } else {
      resolved = theme;
    }

    root.classList.add(resolved);
    setResolvedTheme(resolved);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

---

_Complete component library and design system for consistent, accessible UI implementation._

