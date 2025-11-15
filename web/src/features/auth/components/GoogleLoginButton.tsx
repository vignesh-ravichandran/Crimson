// Google Login Button
// Based on design/authentication.md

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export function GoogleLoginButton() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('No credential received from Google');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Exchange Google ID token for our JWT
      const { accessToken, user } = await loginWithGoogle(credentialResponse.credential);
      
      // Store token and user
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update auth context
      setUser(user);
      
      // Redirect to home
      navigate('/');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError('Login failed. Please try again.');
  };

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="filled_blue"
          size="large"
          text="continue_with"
          width="100%"
        />
      )}
      
      {error && (
        <p className="text-sm text-danger text-center">
          {error}
        </p>
      )}
    </div>
  );
}

