import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RadarChart } from '@/components/charts/RadarChart';
import { LineChart } from '@/components/charts/LineChart';
import { StackedBarChart } from '@/components/charts/StackedBarChart';
import { CalendarHeatmap } from '@/components/charts/CalendarHeatmap';
import {
  getRadarData,
  getLineChartData,
  getStackedBarData,
  getHeatmapData,
  RadarDataPoint,
  LineDataPoint,
  StackedBarDataPoint,
  HeatmapDataPoint
} from '@/api/analytics';
import { getJourney } from '@/api/journeys';

type ChartType = 'radar' | 'line' | 'bar' | 'heatmap';
type DateRange = '7d' | '30d' | '90d' | 'all';

export function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [journey, setJourney] = useState<any>(null);
  const [activeChart, setActiveChart] = useState<ChartType>('radar');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chart data
  const [radarData, setRadarData] = useState<RadarDataPoint[]>([]);
  const [lineData, setLineData] = useState<LineDataPoint[]>([]);
  const [barData, setBarData] = useState<{ daily: StackedBarDataPoint[]; dimensions: string[]; colors: Record<string, string> } | null>(null);
  const [heatmapData, setHeatmapData] = useState<{ checkins: HeatmapDataPoint[]; stats: any; period: any } | null>(null);

  useEffect(() => {
    if (id) {
      loadJourney();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadChartData();
    }
  }, [id, dateRange]);

  const loadJourney = async () => {
    try {
      const data = await getJourney(id!);
      setJourney(data);
    } catch (err) {
      console.error('Failed to load journey:', err);
      setError('Failed to load journey');
    }
  };

  const getDateRangeParams = () => {
    const end = new Date().toISOString().split('T')[0];
    let start: string;

    switch (dateRange) {
      case '7d':
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '30d':
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '90d':
        start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'all':
        start = journey?.createdAt ? new Date(journey.createdAt).toISOString().split('T')[0] : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
    }

    return { startDate: start, endDate: end };
  };

  const loadChartData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = getDateRangeParams();

      // Load all charts in parallel
      const [radar, line, bar, heatmap] = await Promise.all([
        getRadarData(id!, params),
        getLineChartData(id!, params),
        getStackedBarData(id!, params),
        getHeatmapData(id!, params)
      ]);

      setRadarData(radar.data.dimensions);
      setLineData(line.data.scores);
      setBarData({
        daily: bar.data.daily,
        dimensions: bar.data.dimensions,
        colors: bar.data.colors
      });
      setHeatmapData({
        checkins: heatmap.data.checkins,
        stats: heatmap.data.stats,
        period: heatmap.data.period
      });

      console.log('📊 Analytics data loaded:', {
        radar: radar.data.dimensions.length,
        line: line.data.scores.length,
        bar: bar.data.daily.length,
        heatmap: heatmap.data.checkins.length
      });
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const chartButtons: { type: ChartType; label: string; icon: string }[] = [
    { type: 'radar', label: 'Spider Chart', icon: '🕸️' },
    { type: 'line', label: 'Trend', icon: '📈' },
    { type: 'bar', label: 'Daily Breakdown', icon: '📊' },
    { type: 'heatmap', label: 'Consistency', icon: '🗓️' }
  ];

  const dateRangeButtons: { range: DateRange; label: string }[] = [
    { range: '7d', label: 'Week' },
    { range: '30d', label: 'Month' },
    { range: '90d', label: '3 Months' },
    { range: 'all', label: 'All Time' }
  ];

  if (isLoading && !radarData.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-500">📊 Analytics</h1>
            {journey && (
              <p className="text-muted mt-1">{journey.title}</p>
            )}
          </div>
          <Button variant="secondary" onClick={() => navigate(`/journeys/${id}`)}>
            ← Back to Journey
          </Button>
        </div>

        {/* Date Range Selector */}
        <Card variant="bordered">
          <h3 className="text-sm font-medium text-muted mb-3">Time Period</h3>
          <div className="flex gap-2 flex-wrap">
            {dateRangeButtons.map(({ range, label }) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface text-text hover:bg-surface-hover border border-border'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>

        {/* Chart Type Selector */}
        <Card variant="bordered">
          <h3 className="text-sm font-medium text-muted mb-3">Visualization</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {chartButtons.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => setActiveChart(type)}
                className={`p-4 rounded-lg text-center transition-all ${
                  activeChart === type
                    ? 'bg-primary-500 text-white shadow-lg scale-105'
                    : 'bg-surface text-text hover:bg-surface-hover border border-border'
                }`}
              >
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-sm font-medium">{label}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <Card variant="bordered">
            <p className="text-danger text-center">{error}</p>
            <Button variant="secondary" className="w-full mt-4" onClick={loadChartData}>
              Try Again
            </Button>
          </Card>
        )}

        {/* Chart Display */}
        {!error && (
          <Card variant="elevated" className="p-6">
            {activeChart === 'radar' && (
              <RadarChart 
                data={radarData} 
                title="Dimension Strengths (Spider Chart)"
              />
            )}
            
            {activeChart === 'line' && (
              <LineChart 
                data={lineData} 
                title="Score Trend Over Time"
              />
            )}
            
            {activeChart === 'bar' && barData && (
              <StackedBarChart 
                data={barData.daily}
                dimensions={barData.dimensions}
                colors={barData.colors}
                title="Daily Breakdown by Dimension"
              />
            )}
            
            {activeChart === 'heatmap' && heatmapData && (
              <CalendarHeatmap 
                data={heatmapData.checkins}
                startDate={heatmapData.period.start}
                endDate={heatmapData.period.end}
                stats={heatmapData.stats}
                title="Check-in Consistency Calendar"
              />
            )}
          </Card>
        )}

        {/* Dynamic Info Card - Shows info for currently selected chart */}
        <Card variant="bordered">
          <div className="text-sm">
            {activeChart === 'radar' && (
              <div className="space-y-2">
                <p className="font-semibold text-text">🕸️ Spider Chart</p>
                <p className="text-muted">
                  Shows your average performance in each dimension. A balanced web shape means you're performing consistently across all areas. 
                  Irregular shapes reveal your strongest and weakest dimensions at a glance.
                </p>
                <p className="text-muted">
                  <strong className="text-text">Tip:</strong> Aim for a balanced shape by focusing on your weaker dimensions!
                </p>
              </div>
            )}
            
            {activeChart === 'line' && (
              <div className="space-y-2">
                <p className="font-semibold text-text">📈 Score Trend</p>
                <p className="text-muted">
                  Track how your total score changes over time. An upward trend shows improvement, while dips might indicate challenging periods or 
                  areas needing attention.
                </p>
                <p className="text-muted">
                  <strong className="text-text">Tip:</strong> Look for patterns - are certain days consistently lower? Weekend effects? Use insights to adjust your routine.
                </p>
              </div>
            )}
            
            {activeChart === 'bar' && (
              <div className="space-y-2">
                <p className="font-semibold text-text">📊 Daily Breakdown</p>
                <p className="text-muted">
                  See which dimensions contribute to your daily scores. Each colored segment represents a different dimension. 
                  Hover over bars to see exact values.
                </p>
                <p className="text-muted">
                  <strong className="text-text">Tip:</strong> Use this to identify which areas you're naturally focusing on and which need more attention.
                </p>
              </div>
            )}
            
            {activeChart === 'heatmap' && (
              <div className="space-y-2">
                <p className="font-semibold text-text">🗓️ Consistency Calendar</p>
                <p className="text-muted">
                  GitHub-style heatmap showing your check-in patterns. Darker crimson squares indicate higher scores. 
                  Empty squares show missed days. Hover over any square to see details.
                </p>
                <p className="text-muted">
                  <strong className="text-text">Tip:</strong> Build streaks by checking in daily. Consistency is key to long-term progress!
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

