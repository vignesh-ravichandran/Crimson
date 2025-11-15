# Charts & Analytics - Crimson Club

Complete specification for all 6 chart types, data aggregation, and analytics dashboard.

---

## Overview

Analytics dashboard provides visual insights into progress across multiple dimensions. All charts are:
- **Mobile-optimized**: Touch-friendly, responsive
- **Interactive**: Tap to drilldown
- **Accessible**: Screen-reader friendly with text summaries

**Library**: Recharts (React wrapper for D3)

---

## 1. Chart Types

### 1.1 Radar Graph - Multi-Dimension Strengths

**Purpose**: Show average performance across all dimensions for a selected period.

#### Data Structure

```typescript
interface RadarChartData {
  dimension: string;
  avgScore: number;
  maxScore: number; // dimension.weight * 3 (max effort)
  color: string;
}

// Example
const radarData: RadarChartData[] = [
  { dimension: 'Cardio', avgScore: 4.2, maxScore: 9, color: '#DC143C' },
  { dimension: 'Strength', avgScore: 3.5, maxScore: 6, color: '#8B0000' },
  { dimension: 'Diet', avgScore: 5.1, maxScore: 12, color: '#CD5C5C' }
];
```

#### API Endpoint

```
GET /api/v1/journeys/:journeyId/analytics/radar?userId={id}&startDate={date}&endDate={date}

Response:
{
  "data": {
    "dimensions": [
      {
        "dimension_id": "uuid",
        "dimension_name": "Cardio",
        "avg_score": 4.2,
        "max_possible_score": 9,
        "checkin_count": 7,
        "color": "#DC143C"
      }
    ],
    "period": "2025-11-08 to 2025-11-15"
  }
}
```

#### Backend Query

```sql
SELECT 
  d.id AS dimension_id,
  d.name AS dimension_name,
  AVG(cd.score) AS avg_score,
  (d.weight * 3) AS max_possible_score,
  COUNT(cd.id) AS checkin_count
FROM dimensions d
LEFT JOIN checkin_details cd ON cd.dimension_id = d.id
LEFT JOIN checkins c ON c.id = cd.checkin_id
WHERE d.journey_id = $1
  AND c.user_id = $2
  AND c.date BETWEEN $3 AND $4
GROUP BY d.id, d.name, d.weight
ORDER BY d.display_order;
```

#### React Component

```tsx
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface Props {
  data: RadarChartData[];
}

export function DimensionRadarChart({ data }: Props) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis 
            dataKey="dimension" 
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 'dataMax']}
            tick={{ fill: '#9CA3AF' }}
          />
          <Radar
            name="Your Score"
            dataKey="avgScore"
            stroke="#DC143C"
            fill="#DC143C"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="sr-only">
        {/* Accessibility: Text summary */}
        Radar chart showing average scores: {data.map(d => 
          `${d.dimension}: ${d.avgScore.toFixed(1)} out of ${d.maxScore}`
        ).join(', ')}
      </div>
    </div>
  );
}
```

---

### 1.2 Stacked Bar Chart - Daily Breakdown

**Purpose**: Show daily total scores broken down by dimension contributions.

#### Data Structure

```typescript
interface StackedBarData {
  date: string; // 'Mon', 'Tue', or '2025-11-08'
  [dimensionName: string]: number | string; // dynamic keys for each dimension
  total: number;
}

// Example
const stackedBarData: StackedBarData[] = [
  { date: 'Mon', Cardio: 6, Strength: 4, Diet: 8, total: 18 },
  { date: 'Tue', Cardio: 9, Strength: 2, Diet: 6, total: 17 },
  { date: 'Wed', Cardio: 3, Strength: 6, Diet: 9, total: 18 }
];
```

#### API Endpoint

```
GET /api/v1/journeys/:journeyId/analytics/stacked-bar?userId={id}&startDate={date}&endDate={date}

Response:
{
  "data": {
    "daily_breakdown": [
      {
        "date": "2025-11-08",
        "day_label": "Mon",
        "dimensions": {
          "Cardio": 6,
          "Strength": 4,
          "Diet": 8
        },
        "total_score": 18
      }
    ],
    "dimension_colors": {
      "Cardio": "#DC143C",
      "Strength": "#8B0000",
      "Diet": "#CD5C5C"
    }
  }
}
```

#### Backend Query

```sql
WITH daily_scores AS (
  SELECT 
    c.date,
    d.name AS dimension_name,
    SUM(cd.score) AS dimension_score
  FROM checkins c
  JOIN checkin_details cd ON cd.checkin_id = c.id
  JOIN dimensions d ON d.id = cd.dimension_id
  WHERE c.journey_id = $1
    AND c.user_id = $2
    AND c.date BETWEEN $3 AND $4
  GROUP BY c.date, d.name
)
SELECT 
  date,
  json_object_agg(dimension_name, dimension_score) AS dimensions,
  SUM(dimension_score) AS total_score
FROM daily_scores
GROUP BY date
ORDER BY date;
```

#### React Component

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  data: StackedBarData[];
  dimensionNames: string[];
  colors: Record<string, string>;
}

export function StackedDailyBarChart({ data, dimensionNames, colors }: Props) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis tick={{ fill: '#9CA3AF' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: 'none',
              borderRadius: '8px'
            }}
          />
          <Legend />
          {dimensionNames.map(dim => (
            <Bar 
              key={dim}
              dataKey={dim} 
              stackId="a" 
              fill={colors[dim]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

### 1.3 Line Chart - Total Progress Over Time

**Purpose**: Track cumulative or daily total scores with trend line.

#### Data Structure

```typescript
interface LineChartData {
  date: string;
  score: number;
  movingAverage?: number; // 7-day MA
}

const lineData: LineChartData[] = [
  { date: '2025-11-01', score: 18, movingAverage: 17.5 },
  { date: '2025-11-02', score: 22, movingAverage: 18.2 }
];
```

#### API Endpoint

```
GET /api/v1/journeys/:journeyId/analytics/line?userId={id}&startDate={date}&endDate={date}&includeMA=true

Response:
{
  "data": {
    "scores": [
      {
        "date": "2025-11-08",
        "total_score": 18,
        "moving_average_7d": 17.5
      }
    ],
    "trend": "upward", // 'upward', 'downward', 'stable'
    "avg_score": 18.3
  }
}
```

#### Backend Query

```sql
WITH daily_totals AS (
  SELECT 
    date,
    total_score
  FROM checkins
  WHERE user_id = $1
    AND journey_id = $2
    AND date BETWEEN $3 AND $4
  ORDER BY date
),
moving_avg AS (
  SELECT 
    date,
    total_score,
    AVG(total_score) OVER (
      ORDER BY date 
      ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS moving_average_7d
  FROM daily_totals
)
SELECT * FROM moving_avg;
```

#### React Component

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  data: LineChartData[];
  showMovingAverage?: boolean;
}

export function ProgressLineChart({ data, showMovingAverage = true }: Props) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis tick={{ fill: '#9CA3AF' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: 'none' 
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#DC143C" 
            strokeWidth={2}
            dot={{ fill: '#DC143C', r: 4 }}
          />
          {showMovingAverage && (
            <Line 
              type="monotone" 
              dataKey="movingAverage" 
              stroke="#8B0000" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

### 1.4 Calendar Heatmap - Consistency

**Purpose**: Visualize check-in frequency and scores over months.

#### Data Structure

```typescript
interface HeatmapData {
  date: string; // 'YYYY-MM-DD'
  score: number;
  intensity: number; // 0-4 for color gradation
}

const heatmapData: HeatmapData[] = [
  { date: '2025-11-01', score: 18, intensity: 3 },
  { date: '2025-11-02', score: 22, intensity: 4 },
  { date: '2025-11-03', score: 0, intensity: 0 } // no check-in
];
```

#### API Endpoint

```
GET /api/v1/journeys/:journeyId/analytics/heatmap?userId={id}&startDate={date}&endDate={date}

Response:
{
  "data": {
    "days": [
      {
        "date": "2025-11-08",
        "total_score": 18,
        "intensity": 3,
        "has_checkin": true
      }
    ],
    "max_score": 24, // for normalization
    "completion_rate": 85.7
  }
}
```

#### Backend Query

```sql
WITH date_series AS (
  SELECT generate_series(
    $3::date,
    $4::date,
    '1 day'::interval
  )::date AS date
),
checkin_scores AS (
  SELECT 
    date,
    total_score
  FROM checkins
  WHERE user_id = $1
    AND journey_id = $2
)
SELECT 
  ds.date,
  COALESCE(cs.total_score, 0) AS total_score,
  CASE 
    WHEN cs.total_score IS NULL THEN 0
    WHEN cs.total_score <= 5 THEN 1
    WHEN cs.total_score <= 10 THEN 2
    WHEN cs.total_score <= 15 THEN 3
    ELSE 4
  END AS intensity,
  (cs.total_score IS NOT NULL) AS has_checkin
FROM date_series ds
LEFT JOIN checkin_scores cs ON cs.date = ds.date
ORDER BY ds.date;
```

#### React Component

```tsx
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

interface Props {
  data: HeatmapData[];
  onDayClick?: (date: string) => void;
}

export function CheckinHeatmap({ data, onDayClick }: Props) {
  return (
    <div className="w-full">
      <CalendarHeatmap
        startDate={new Date('2025-01-01')}
        endDate={new Date('2025-12-31')}
        values={data.map(d => ({
          date: d.date,
          count: d.intensity
        }))}
        classForValue={(value) => {
          if (!value) return 'color-empty';
          return `color-scale-${value.count}`;
        }}
        onClick={(value) => value && onDayClick?.(value.date)}
        tooltipDataAttrs={(value: any) => {
          if (!value || !value.date) return {};
          const item = data.find(d => d.date === value.date);
          return {
            'data-tip': item 
              ? `${item.date}: ${item.score} points`
              : `${value.date}: No check-in`
          };
        }}
      />
      
      {/* Custom styles */}
      <style>{`
        .color-empty { fill: #1F2937; }
        .color-scale-1 { fill: #FCA5A5; }
        .color-scale-2 { fill: #EF4444; }
        .color-scale-3 { fill: #DC143C; }
        .color-scale-4 { fill: #8B0000; }
      `}</style>
    </div>
  );
}
```

---

### 1.5 Radar Over Time - Dimension Trends

**Purpose**: Show how each dimension's average score changes week-over-week.

#### Data Structure

```typescript
interface RadarTimeSeriesData {
  week: string; // 'Week 1', 'Week 2', etc.
  [dimensionName: string]: number | string;
}

const radarTimeData: RadarTimeSeriesData[] = [
  { week: 'Week 1', Cardio: 4.2, Strength: 3.5, Diet: 5.1 },
  { week: 'Week 2', Cardio: 5.0, Strength: 4.2, Diet: 4.8 }
];
```

#### API Endpoint

```
GET /api/v1/journeys/:journeyId/analytics/radar-over-time?userId={id}&weeks={number}

Response:
{
  "data": {
    "weekly_averages": [
      {
        "week_key": "2025-W45",
        "week_label": "Week 1",
        "dimensions": {
          "Cardio": 4.2,
          "Strength": 3.5,
          "Diet": 5.1
        }
      }
    ],
    "dimension_names": ["Cardio", "Strength", "Diet"],
    "colors": {
      "Cardio": "#DC143C",
      "Strength": "#8B0000",
      "Diet": "#CD5C5C"
    }
  }
}
```

#### Backend Query

```sql
WITH weekly_scores AS (
  SELECT 
    TO_CHAR(c.date, 'IYYY-"W"IW') AS week_key,
    d.name AS dimension_name,
    AVG(cd.score) AS avg_score
  FROM checkins c
  JOIN checkin_details cd ON cd.checkin_id = c.id
  JOIN dimensions d ON d.id = cd.dimension_id
  WHERE c.user_id = $1
    AND c.journey_id = $2
    AND c.date >= CURRENT_DATE - INTERVAL '12 weeks'
  GROUP BY week_key, d.name
)
SELECT 
  week_key,
  json_object_agg(dimension_name, ROUND(avg_score::numeric, 1)) AS dimensions
FROM weekly_scores
GROUP BY week_key
ORDER BY week_key;
```

#### React Component

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  data: RadarTimeSeriesData[];
  dimensionNames: string[];
  colors: Record<string, string>;
}

export function DimensionTrendsChart({ data, dimensionNames, colors }: Props) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="week" 
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis tick={{ fill: '#9CA3AF' }} />
          <Tooltip />
          <Legend />
          {dimensionNames.map(dim => (
            <Line 
              key={dim}
              type="monotone" 
              dataKey={dim} 
              stroke={colors[dim]}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

### 1.6 Comparison Mode - Week-over-Week

**Purpose**: Compare current week vs previous week side-by-side.

#### Data Structure

```typescript
interface ComparisonData {
  dimension: string;
  currentWeek: number;
  previousWeek: number;
  change: number; // percentage
  changeType: 'increase' | 'decrease' | 'same';
}

const comparisonData: ComparisonData[] = [
  { 
    dimension: 'Cardio', 
    currentWeek: 5.2, 
    previousWeek: 4.2, 
    change: 23.8,
    changeType: 'increase'
  }
];
```

#### API Endpoint

```
GET /api/v1/journeys/:journeyId/analytics/comparison?userId={id}&compareWeeks=true

Response:
{
  "data": {
    "current_week": {
      "week_key": "2025-W46",
      "dimensions": { "Cardio": 5.2, "Strength": 4.5 },
      "total_score": 120
    },
    "previous_week": {
      "week_key": "2025-W45",
      "dimensions": { "Cardio": 4.2, "Strength": 3.8 },
      "total_score": 95
    },
    "changes": [
      {
        "dimension": "Cardio",
        "change_percent": 23.8,
        "change_type": "increase"
      }
    ],
    "overall_change_percent": 26.3
  }
}
```

#### React Component

```tsx
interface Props {
  data: ComparisonData[];
}

export function WeekComparisonView({ data }: Props) {
  return (
    <div className="space-y-4">
      {data.map(item => (
        <div key={item.dimension} className="flex items-center justify-between p-4 bg-surface rounded-lg">
          <div>
            <h4 className="font-medium">{item.dimension}</h4>
            <div className="flex gap-4 mt-2 text-sm text-muted">
              <span>This week: {item.currentWeek.toFixed(1)}</span>
              <span>Last week: {item.previousWeek.toFixed(1)}</span>
            </div>
          </div>
          <div className={`flex items-center gap-2 font-bold ${
            item.changeType === 'increase' ? 'text-green-500' : 
            item.changeType === 'decrease' ? 'text-red-500' : 
            'text-gray-500'
          }`}>
            {item.changeType === 'increase' && '↑'}
            {item.changeType === 'decrease' && '↓'}
            {Math.abs(item.change).toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 2. Chart Drilldown Feature

### 2.1 Interaction Flow

1. User taps on a day in any chart
2. Modal/drawer opens showing that day's details
3. Display all dimension efforts and scores
4. Option to edit check-in (if within 7 days)

### 2.2 Drilldown Component

```tsx
interface CheckinDetail {
  date: string;
  dimensions: Array<{
    name: string;
    effortLevel: number;
    score: number;
  }>;
  totalScore: number;
}

interface Props {
  checkinDetail: CheckinDetail;
  onClose: () => void;
  onEdit?: () => void;
}

export function CheckinDrilldownModal({ checkinDetail, onClose, onEdit }: Props) {
  const canEdit = isWithin7Days(checkinDetail.date);

  return (
    <Modal open onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-4">
          {formatDate(checkinDetail.date)}
        </h3>
        
        <div className="space-y-3 mb-6">
          {checkinDetail.dimensions.map(dim => (
            <div key={dim.name} className="flex justify-between items-center">
              <div>
                <span className="font-medium">{dim.name}</span>
                <span className="ml-2 text-sm text-muted">
                  {getEffortLabel(dim.effortLevel)}
                </span>
              </div>
              <span className="font-bold text-primary-500">
                {dim.score} pts
              </span>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 flex justify-between items-center">
          <span className="font-bold">Total Score</span>
          <span className="text-2xl font-bold text-primary-500">
            {checkinDetail.totalScore}
          </span>
        </div>

        <div className="flex gap-3 mt-6">
          {canEdit && (
            <button onClick={onEdit} className="btn-secondary flex-1">
              Edit Check-in
            </button>
          )}
          <button onClick={onClose} className="btn-primary flex-1">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
```

---

## 3. Analytics Dashboard Layout

### 3.1 Date Range Selector

```tsx
type DateRange = '7d' | '30d' | '3m' | '1y' | 'all';

interface Props {
  selected: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeSelector({ selected, onChange }: Props) {
  const ranges: DateRange[] = ['7d', '30d', '3m', '1y', 'all'];
  const labels = {
    '7d': '7 Days',
    '30d': '30 Days',
    '3m': '3 Months',
    '1y': '1 Year',
    'all': 'All Time'
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {ranges.map(range => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            selected === range
              ? 'bg-primary-500 text-white'
              : 'bg-surface text-muted hover:bg-surface-hover'
          }`}
        >
          {labels[range]}
        </button>
      ))}
    </div>
  );
}
```

### 3.2 Chart Type Switcher

```tsx
type ChartType = 'radar' | 'stacked' | 'line' | 'heatmap' | 'trends' | 'comparison';

interface Props {
  selected: ChartType;
  onChange: (type: ChartType) => void;
}

export function ChartTypeSwitcher({ selected, onChange }: Props) {
  const charts = [
    { type: 'radar', icon: '🎯', label: 'Strengths' },
    { type: 'stacked', icon: '📊', label: 'Daily' },
    { type: 'line', icon: '📈', label: 'Progress' },
    { type: 'heatmap', icon: '🗓️', label: 'Calendar' },
    { type: 'trends', icon: '📉', label: 'Trends' },
    { type: 'comparison', icon: '⚖️', label: 'Compare' }
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-2 mb-6">
      {charts.map(chart => (
        <button
          key={chart.type}
          onClick={() => onChange(chart.type)}
          className={`p-3 rounded-lg flex flex-col items-center ${
            selected === chart.type
              ? 'bg-primary-500 text-white'
              : 'bg-surface hover:bg-surface-hover'
          }`}
        >
          <span className="text-2xl mb-1">{chart.icon}</span>
          <span className="text-xs">{chart.label}</span>
        </button>
      ))}
    </div>
  );
}
```

---

## 4. Performance Optimization

### 4.1 Data Caching

- Cache aggregated analytics data for 5 minutes (Redis)
- Invalidate cache when new check-in is submitted
- Pre-fetch next date range on user interaction

### 4.2 Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const RadarChart = lazy(() => import('./RadarChart'));
const StackedBarChart = lazy(() => import('./StackedBarChart'));

export function AnalyticsDashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      {chartType === 'radar' && <RadarChart data={data} />}
      {chartType === 'stacked' && <StackedBarChart data={data} />}
    </Suspense>
  );
}
```

### 4.3 Database Indexes

```sql
-- For analytics queries
CREATE INDEX idx_checkins_analytics ON checkins(journey_id, user_id, date DESC);
CREATE INDEX idx_checkin_details_analytics ON checkin_details(checkin_id, dimension_id);
CREATE INDEX idx_dimensions_journey_order ON dimensions(journey_id, display_order);
```

---

## 5. Accessibility

- **Alt text**: Provide text summaries for screen readers
- **Keyboard navigation**: All interactive elements keyboard accessible
- **Color contrast**: Ensure chart colors meet WCAG AA standards
- **Focus indicators**: Visible focus states on chart elements

```tsx
// Example accessibility wrapper
<div role="img" aria-label={`Radar chart showing ${data.length} dimensions with scores ranging from ${minScore} to ${maxScore}`}>
  <RadarChart data={data} />
</div>
```

---

_All 6 chart types fully specified with data structures, APIs, components, and interactions._

