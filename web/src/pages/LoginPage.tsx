// Login Page

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLoginButton } from '@/features/auth/components/GoogleLoginButton';
import { Card } from '@/components/ui/Card';

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card variant="elevated" className="max-w-md w-full p-8">
        <div className="text-center space-y-6">
          {/* Logo/Title */}
          <div>
            <h1 className="text-4xl font-bold text-primary-500 mb-2">
              🔥 Crimson Club
            </h1>
            <p className="text-muted">
              Track your journey, one day at a time
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Login Button */}
          <div>
            <GoogleLoginButton />
          </div>

          {/* Footer */}
          <p className="text-xs text-muted">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </Card>
    </div>
  );
}

