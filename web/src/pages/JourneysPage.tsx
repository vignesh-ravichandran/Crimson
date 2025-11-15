// Journeys List Page

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listJourneys, Journey } from '@/api/journeys';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CreateJourneyModal } from '@/features/journeys/components/CreateJourneyModal';

export function JourneysPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'public' | 'myJourneys'>('all');
  
  // Check if we're in check-in mode
  const isCheckinMode = searchParams.get('mode') === 'checkin';

  // Watch for URL parameter changes
  useEffect(() => {
    if (isCheckinMode) {
      setFilter('myJourneys');
    } else {
      setFilter('all');
    }
  }, [searchParams, isCheckinMode]);

  useEffect(() => {
    loadJourneys();
  }, [filter]);

  const loadJourneys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listJourneys({
        isPublic: filter === 'public' ? true : undefined,
        memberOnly: filter === 'myJourneys' ? true : undefined,
        excludeCheckedInDate: isCheckinMode ? new Date().toISOString().split('T')[0] : undefined,
        pageSize: 50,
      });
      setJourneys(response.data);
    } catch (err: any) {
      console.error('Failed to load journeys:', err);
      setError('Failed to load journeys. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredJourneys = journeys.filter((journey) =>
    journey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journey.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJourneyCreated = (journeyId: string) => {
    setShowCreateModal(false);
    // Navigate directly to the created journey instead of staying on list
    navigate(`/journeys/${journeyId}`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-500">
              {isCheckinMode ? '📝 Daily Check-In' : 'Journeys'}
            </h1>
            <p className="text-muted mt-1">
              {isCheckinMode 
                ? 'Select a journey to check in on today' 
                : 'Browse and join journeys to start tracking'}
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/')}>
            ← Back
          </Button>
        </div>

        {/* Search and Filter - Hidden in check-in mode */}
        {!isCheckinMode && (
          <Card variant="bordered">
            <div className="space-y-4">
              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder="Search journeys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background text-text"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted">Filter:</span>
                <button
                  onClick={() => setFilter('myJourneys')}
                  className={`px-3 py-1 rounded text-sm ${
                    filter === 'myJourneys'
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface text-text hover:bg-surface-hover'
                  }`}
                >
                  📝 My Journeys
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded text-sm ${
                    filter === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface text-text hover:bg-surface-hover'
                  }`}
                >
                  All Journeys
                </button>
                <button
                  onClick={() => setFilter('public')}
                  className={`px-3 py-1 rounded text-sm ${
                    filter === 'public'
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface text-text hover:bg-surface-hover'
                  }`}
                >
                  Public Only
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Create Button - Hidden in check-in mode */}
        {!isCheckinMode && (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Create New Journey
          </Button>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card variant="bordered">
            <p className="text-danger text-center">{error}</p>
            <Button variant="secondary" className="w-full mt-4" onClick={loadJourneys}>
              Try Again
            </Button>
          </Card>
        )}

        {/* Journeys List */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {filteredJourneys.length === 0 ? (
              <Card variant="bordered">
                <div className="text-center py-8">
                  <p className="text-muted mb-4">
                    {searchQuery ? 'No journeys found matching your search.' : 'No journeys yet.'}
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create Your First Journey
                  </Button>
                </div>
              </Card>
            ) : (
              filteredJourneys.map((journey) => (
                <Card
                  key={journey.id}
                  variant="elevated"
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    // In check-in mode, go directly to check-in page
                    if (isCheckinMode) {
                      navigate(`/checkin?journeyId=${journey.id}`);
                    } else {
                      navigate(`/journeys/${journey.id}`);
                    }
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-text">
                          {journey.title}
                        </h3>
                        {journey.description && (
                          <p className="text-muted mt-1">{journey.description}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          journey.isPublic
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {journey.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span>👥 {journey.memberCount || 0} members</span>
                      <span>
                        📅 Created {new Date(journey.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => {
                          if (isCheckinMode) {
                            navigate(`/checkin?journeyId=${journey.id}`);
                          } else {
                            navigate(`/journeys/${journey.id}`);
                          }
                        }}
                      >
                        {isCheckinMode ? '📝 Check In Now →' : 'View Details →'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Journey Modal */}
      {showCreateModal && (
        <CreateJourneyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleJourneyCreated}
        />
      )}
    </div>
  );
}

