// Main App Component
// Based on design/Design.md

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { HomePage } from '@/pages/HomePage';
import { JourneysPage } from '@/pages/JourneysPage';
import { JourneyDetailPage } from '@/pages/JourneyDetailPage';
import { CheckinPage } from '@/pages/CheckinPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-text">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/journeys" element={<JourneysPage />} />
                <Route path="/journeys/:id" element={<JourneyDetailPage />} />
                <Route path="/journeys/:id/analytics" element={<AnalyticsPage />} />
                <Route path="/checkin" element={<CheckinPage />} />
                {/* TODO: Add profile page */}
                {/* <Route path="/profile" element={<ProfilePage />} /> */}
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

