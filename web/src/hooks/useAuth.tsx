// Authentication Hook & Context
// Based on design/authentication.md

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, getStoredToken, getStoredUser, logout } from '@/api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    const cachedUser = getStoredUser();

    if (token && cachedUser) {
      // Use cached user immediately
      setUser(cachedUser);
      setIsLoading(false);
      
      // Optional: verify in background (but don't logout on error)
      getCurrentUser()
        .then(userData => {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        })
        .catch(error => {
          console.warn('Failed to refresh user data:', error);
          // Keep using cached user, don't logout
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    logout();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading,
        setUser,
        logout: handleLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

