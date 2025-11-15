// Daily Check-in Page

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getJourney } from '@/api/journeys';
import { submitCheckin, getCheckins, getTodayDate, getDateDaysAgo, formatDate } from '@/api/checkins';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SwipeCard } from '@/components/ui/SwipeCard';
import { EffortLevelSelector } from '@/features/checkin/components/EffortLevelSelector';

interface Dimension {
  id: string;
  name: string;
  description?: string;
  weight: number;
}

export function CheckinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const journeyId = searchParams.get('journeyId');

  const [journey, setJourney] = useState<any>(null);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [effortLevels, setEffortLevels] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [existingCheckinDates, setExistingCheckinDates] = useState<Set<string>>(new Set());

  // Generate last 7 days for date selector
  const availableDates = Array.from({ length: 7 }, (_, i) => getDateDaysAgo(i));

  useEffect(() => {
    if (!journeyId) {
      setError('No journey selected');
      setIsLoading(false);
      return;
    }
    loadJourney();
  }, [journeyId]);

  const loadJourney = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getJourney(journeyId!);
      setJourney(data);
      setDimensions(data.dimensions || []);
      
      // Initialize effort levels to 3 (moderate)
      const initialLevels: Record<string, number> = {};
      data.dimensions.forEach((d: Dimension) => {
        initialLevels[d.id] = 3;
      });
      setEffortLevels(initialLevels);

      // Load existing check-ins for the last 7 days
      await loadExistingCheckins();
    } catch (err: any) {
      console.error('Failed to load journey:', err);
      setError('Failed to load journey. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingCheckins = async () => {
    try {
      const sevenDaysAgo = getDateDaysAgo(6);
      const today = getTodayDate();
      
      const response = await getCheckins({
        journeyId: journeyId!,
        startDate: sevenDaysAgo,
        endDate: today,
      });

      // Create a Set of dates that have check-ins
      // Normalize dates to YYYY-MM-DD format
      const dates = new Set(
        response.data.map(c => {
          const dateStr = typeof c.date === 'string' ? c.date.split('T')[0] : c.date;
          return dateStr;
        })
      );
      
      setExistingCheckinDates(dates);
    } catch (err) {
      console.error('❌ Failed to load existing check-ins:', err);
    }
  };

  const handleNext = () => {
    if (currentIndex < dimensions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleEffortChange = (dimensionId: string, level: number) => {
    setEffortLevels((prev) => ({ ...prev, [dimensionId]: level }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const details = dimensions.map((d) => ({
        dimensionId: d.id,
        effortLevel: effortLevels[d.id] ?? 2, // Default: Moderate (use ?? instead of || to allow 0)
      }));

      await submitCheckin({
        journeyId: journeyId!,
        date: selectedDate,
        details,
        clientCheckinId: `${journeyId}-${selectedDate}-${Date.now()}`,
      });

      setShowSuccess(true);
      
      // Redirect after 2 seconds with reload flag
      setTimeout(() => {
        navigate(`/journeys/${journeyId}`, { 
          state: { reloadData: true }
        });
      }, 2000);
    } catch (err: any) {
      console.error('Failed to submit check-in:', err);
      setError(err.response?.data?.error?.message || 'Failed to submit check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error && !journey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card variant="bordered" className="max-w-md w-full">
          <p className="text-danger text-center mb-4">{error}</p>
          <Button variant="secondary" className="w-full" onClick={() => navigate('/journeys')}>
            ← Back to Journeys
          </Button>
        </Card>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card variant="elevated" className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-primary-500 mb-2">
            Check-in Complete!
          </h2>
          <p className="text-muted">
            Great job! Your progress has been recorded.
          </p>
        </Card>
      </div>
    );
  }

  const currentDimension = dimensions[currentIndex];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => navigate(`/journeys/${journeyId}`)}>
            ← Cancel
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold text-text">{journey?.title}</h1>
            <p className="text-sm text-muted">Daily Check-in</p>
          </div>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>

        {/* Date Selector */}
        <Card variant="bordered">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text">Select Date</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableDates.map((date) => {
                const hasCheckin = existingCheckinDates.has(date);
                const isSelected = selectedDate === date;
                
                // Determine colors - using inline styles for guaranteed rendering
                let bgColor, textColor, borderColor;
                
                if (isSelected && hasCheckin) {
                  // YELLOW - Editing existing
                  bgColor = '#EAB308'; // yellow-500
                  textColor = '#FFFFFF';
                  borderColor = '#CA8A04'; // yellow-600
                } else if (isSelected && !hasCheckin) {
                  // CRIMSON - New checkin
                  bgColor = '#DC143C'; // primary crimson
                  textColor = '#FFFFFF';
                  borderColor = '#B91C1C'; // darker crimson
                } else if (hasCheckin) {
                  // GREEN - Already done
                  bgColor = '#22C55E'; // green-500
                  textColor = '#FFFFFF';
                  borderColor = '#16A34A'; // green-600
                } else {
                  // GRAY - Not done
                  bgColor = '#E5E7EB'; // gray-200
                  textColor = '#1F2937'; // gray-800
                  borderColor = '#D1D5DB'; // gray-300
                }
                
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className="flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all relative min-w-[100px] font-medium"
                    style={{
                      backgroundColor: bgColor,
                      color: textColor,
                      borderColor: borderColor,
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: isSelected ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    {hasCheckin && !isSelected && (
                      <div 
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-md"
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#16A34A'
                        }}
                      >
                        <span style={{ color: '#16A34A', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                      </div>
                    )}
                    <div className="text-sm font-bold">{formatDate(date)}</div>
                    <div className="text-xs mt-1 opacity-90">{date.split('-').slice(1).join('/')}</div>
                    {isSelected && (
                      <div className="text-xs mt-1 font-bold">
                        {hasCheckin ? '✏️ Editing' : '➕ New'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Progress */}
        <div className="text-center">
          <p className="text-sm text-muted mb-2">
            Dimension {currentIndex + 1} of {dimensions.length}
          </p>
          <div className="w-full bg-surface rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / dimensions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Dimension Card */}
        {currentDimension && (
          <SwipeCard
            onSwipeLeft={handleNext}
            onSwipeRight={handlePrevious}
          >
            <Card variant="elevated" className="p-6">
              <div className="space-y-6">
                {/* Dimension Info */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-text mb-2">
                    {currentDimension.name}
                  </h2>
                  {currentDimension.description && (
                    <p className="text-muted">{currentDimension.description}</p>
                  )}
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <span className="text-sm text-muted">Weight:</span>
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < currentDimension.weight
                            ? 'bg-primary-500'
                            : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Effort Level Selector */}
                <EffortLevelSelector
                  value={effortLevels[currentDimension.id] ?? 2}
                  onChange={(level) => handleEffortChange(currentDimension.id, level)}
                />

                {/* Swipe Hint */}
                <p className="text-center text-xs text-muted">
                  ← Swipe or use buttons to navigate →
                </p>
              </div>
            </Card>
          </SwipeCard>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            ← Previous
          </Button>
          {currentIndex < dimensions.length - 1 ? (
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleNext}
            >
              Next →
            </Button>
          ) : (
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (existingCheckinDates.has(selectedDate) ? 'Updating...' : 'Submitting...') 
                : (existingCheckinDates.has(selectedDate) ? '✏️ Update Check-in' : '✓ Submit Check-in')
              }
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <Card variant="bordered">
            <p className="text-danger text-center">{error}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

