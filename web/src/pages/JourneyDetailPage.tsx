// Journey Detail Page

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getJourney, joinJourney } from '@/api/journeys';
import { getCheckins } from '@/api/checkins';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';

interface JourneyDetail {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  dimensions: Array<{
    id: string;
    name: string;
    description?: string;
    weight: number;
  }>;
  members: Array<{
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    role: string;
    joinedAt: string;
  }>;
  stats?: {
    totalCheckins: number;
    currentStreak: number;
    averageScore: number;
  };
}

export function JourneyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [journey, setJourney] = useState<JourneyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);

  const isMember = journey?.members.some((m) => m.id === user?.id);

  useEffect(() => {
    if (id) {
      loadJourney();
      // Clear the state after loading
      if (location.state?.reloadData) {
        window.history.replaceState({}, document.title);
      }
    }
  }, [id, location.state]);

  useEffect(() => {
    if (id && isMember) {
      loadRecentCheckins();
    }
  }, [id, isMember]);

  const loadJourney = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getJourney(id!);
      console.log('📊 Journey loaded:', data);
      console.log('📈 Stats:', data.stats);
      setJourney(data);
    } catch (err: any) {
      console.error('❌ Failed to load journey:', err);
      setError('Failed to load journey. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentCheckins = async () => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      
      const response = await getCheckins({
        journeyId: id!,
        startDate,
        endDate,
        userId: user?.id,
      });
      setRecentCheckins(response.data);
    } catch (err) {
      console.error('Failed to load recent check-ins:', err);
    }
  };

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await joinJourney(id!);
      await loadJourney(); // Reload to update member list
    } catch (err: any) {
      console.error('Failed to join journey:', err);
      alert(err.response?.data?.error?.message || 'Failed to join journey');
    } finally {
      setIsJoining(false);
    }
  };

  const handleStartCheckin = () => {
    navigate(`/checkin?journeyId=${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card variant="bordered" className="max-w-md w-full">
          <p className="text-danger text-center mb-4">{error || 'Journey not found'}</p>
          <Button variant="secondary" className="w-full" onClick={() => navigate('/journeys')}>
            ← Back to Journeys
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => navigate('/journeys')}>
            ← Back
          </Button>
          {isMember && (
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleStartCheckin}>
                📝 Check In Now
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/journeys/${id}/analytics`)}>
                📊 Analytics
              </Button>
            </div>
          )}
        </div>

        {/* Journey Info */}
        <Card variant="elevated">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text">{journey.title}</h1>
                {journey.description && (
                  <p className="text-muted mt-2">{journey.description}</p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded text-sm ${
                  journey.isPublic
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}
              >
                {journey.isPublic ? 'Public' : 'Private'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted">
              <span>📅 Created {new Date(journey.createdAt).toLocaleDateString()}</span>
              <span>👥 {journey.members.length} members</span>
            </div>
          </div>
        </Card>

        {/* Join Button (if not a member) */}
        {!isMember && (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleJoin}
            isLoading={isJoining}
            disabled={isJoining}
          >
            {isJoining ? 'Joining...' : '🚀 Join This Journey'}
          </Button>
        )}

        {/* Stats (if member) */}
        {isMember && journey.stats && (
          <div className="grid grid-cols-3 gap-4">
            <Card variant="bordered">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500">
                  {journey.stats.totalCheckins || 0}
                </div>
                <div className="text-sm text-muted mt-1">Check-ins</div>
              </div>
            </Card>
            <Card variant="bordered">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500">
                  {journey.stats.currentStreak || 0}
                </div>
                <div className="text-sm text-muted mt-1">Day Streak</div>
              </div>
            </Card>
            <Card variant="bordered">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500">
                  {journey.stats.averageScore ? Number(journey.stats.averageScore).toFixed(1) : '0.0'}
                  {journey.dimensions && journey.dimensions.length > 0 && (
                    <span className="text-lg text-muted">
                      {' / '}{journey.dimensions.reduce((sum: number, d: any) => sum + (d.weight * 3.5), 0)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted mt-1">Avg Score</div>
              </div>
            </Card>
          </div>
        )}

        {/* Dimensions */}
        <Card variant="bordered">
          <h2 className="text-xl font-bold mb-4">Dimensions</h2>
          <div className="space-y-3">
            {journey.dimensions.map((dimension) => (
              <div
                key={dimension.id}
                className="flex items-center justify-between p-3 bg-surface rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-text">{dimension.name}</h3>
                  {dimension.description && (
                    <p className="text-sm text-muted mt-1">{dimension.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">Weight:</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < dimension.weight
                            ? 'bg-primary-500'
                            : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Check-ins (if member) */}
        {isMember && (
          <Card variant="bordered">
            <h2 className="text-xl font-bold mb-4">Recent Check-ins (Last 7 Days)</h2>
            {recentCheckins.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted mb-4">No check-ins yet</p>
                <Button variant="primary" onClick={handleStartCheckin}>
                  Submit Your First Check-in
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentCheckins.map((checkin) => (
                  <div
                    key={checkin.id}
                    className="flex items-center justify-between p-3 bg-surface rounded"
                  >
                    <span className="text-sm text-text">
                      {new Date(checkin.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-sm font-medium text-primary-500">
                      Score: {Number(checkin.totalScore || checkin.score || 0).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Members */}
        <Card variant="bordered">
          <h2 className="text-xl font-bold mb-4">Members ({journey.members.length})</h2>
          <div className="space-y-2">
            {journey.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-surface rounded"
              >
                <div className="flex items-center gap-3">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.displayName || member.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                      {(member.displayName || member.username || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-text">
                      {member.displayName || member.username}
                    </div>
                    <div className="text-xs text-muted">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

