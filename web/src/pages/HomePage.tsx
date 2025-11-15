// Home Page (Dashboard)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getUserStats, UserStats } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await getUserStats();
      console.log('🏠 Home stats loaded:', data);
      setStats(data);
    } catch (err) {
      console.error('❌ Failed to load home stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-500">
              🔥 Crimson Club
            </h1>
            <p className="text-muted mt-1">
              Welcome back, {user?.displayName || user?.username}!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="elevated">
            <div className="text-center">
              {isLoading ? (
                <div className="text-3xl font-bold text-muted">-</div>
              ) : (
                <div className="text-3xl font-bold text-primary-500">
                  {stats?.currentStreak || 0}
                </div>
              )}
              <div className="text-sm text-muted mt-1">Current Streak</div>
            </div>
          </Card>
          <Card variant="elevated">
            <div className="text-center">
              {isLoading ? (
                <div className="text-3xl font-bold text-muted">-</div>
              ) : (
                <div className="text-3xl font-bold text-primary-500">
                  {stats?.totalJourneys || 0}
                </div>
              )}
              <div className="text-sm text-muted mt-1">Journeys</div>
            </div>
          </Card>
          <Card variant="elevated">
            <div className="text-center">
              {isLoading ? (
                <div className="text-3xl font-bold text-muted">-</div>
              ) : (
                <div className="text-3xl font-bold text-primary-500">
                  {stats?.totalCheckins || 0}
                </div>
              )}
              <div className="text-sm text-muted mt-1">Check-ins</div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card variant="bordered">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={() => navigate('/journeys?mode=checkin')}
            >
              📝 Daily Check-In
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/journeys')}
            >
              🗺️ Browse Journeys
            </Button>
          </div>
          <p className="text-xs text-muted mt-3 text-center">
            Check in on your active journeys or discover new ones
          </p>
        </Card>

        {/* Getting Started */}
        <Card variant="bordered">
          <h2 className="text-xl font-bold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white font-bold text-sm flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-medium">Create or Join a Journey</h3>
                <p className="text-sm text-muted mt-1">
                  Start by creating your own journey or joining an existing one
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white font-bold text-sm flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-medium">Complete Daily Check-ins</h3>
                <p className="text-sm text-muted mt-1">
                  Track your progress by checking in every day
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white font-bold text-sm flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-medium">Build Streaks & Earn Badges</h3>
                <p className="text-sm text-muted mt-1">
                  Stay consistent and unlock achievements
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

