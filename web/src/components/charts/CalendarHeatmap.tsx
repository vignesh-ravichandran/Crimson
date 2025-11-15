import { HeatmapDataPoint } from '@/api/analytics';
import { useState } from 'react';

interface Props {
  data: HeatmapDataPoint[];
  startDate: string;
  endDate: string;
  stats: {
    totalDays: number;
    checkinDays: number;
    consistency: number;
  };
  title?: string;
}

export function CalendarHeatmap({ data, startDate, endDate, stats, title }: Props) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDataPoint | null>(null);

  // Create a map for quick lookup
  const dataMap = new Map(data.map(d => [d.date, d]));

  // Generate all dates in range
  const start = new Date(startDate);
  const end = new Date(endDate);
  const allDates: Date[] = [];
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    allDates.push(new Date(d));
  }

  // Group by weeks for grid layout
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  allDates.forEach((date, idx) => {
    if (date.getDay() === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
    
    if (idx === allDates.length - 1) {
      weeks.push(currentWeek);
    }
  });

  // Color scale based on level (0-4)
  const getColor = (level: number) => {
    const colors = [
      '#1F2937', // No check-in (dark)
      '#DC143C20', // Level 1 (light crimson)
      '#DC143C50', // Level 2
      '#DC143C80', // Level 3
      '#DC143C',   // Level 4 (full crimson)
    ];
    return colors[Math.min(level, 4)];
  };

  return (
    <div className="w-full space-y-4">
      {title && (
        <h3 className="text-lg font-bold text-text text-center">{title}</h3>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-surface rounded-lg border border-border text-center">
          <div className="text-xs text-muted mb-1">Total Days</div>
          <div className="text-2xl font-bold text-primary-500">{stats.totalDays}</div>
        </div>
        <div className="p-3 bg-surface rounded-lg border border-border text-center">
          <div className="text-xs text-muted mb-1">Check-ins</div>
          <div className="text-2xl font-bold text-green-500">{stats.checkinDays}</div>
        </div>
        <div className="p-3 bg-surface rounded-lg border border-border text-center">
          <div className="text-xs text-muted mb-1">Consistency</div>
          <div className="text-2xl font-bold text-primary-500">{stats.consistency}%</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex gap-0.5 mb-2">
            {weeks.map((week, weekIdx) => {
              const firstDay = week[0];
              const isFirstOfMonth = firstDay.getDate() <= 7;
              
              return (
                <div key={weekIdx} className="flex flex-col" style={{ width: '14px' }}>
                  {isFirstOfMonth && (
                    <span className="text-xs text-muted">
                      {firstDay.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Day labels */}
          <div className="flex gap-2 mb-1">
            <div className="flex flex-col gap-0.5 text-xs text-muted w-8">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="h-[14px] leading-[14px]">
                  {day[0]}
                </div>
              ))}
            </div>

            {/* Grid of days */}
            <div className="flex gap-0.5">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-0.5">
                  {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
                    const date = week.find(d => d.getDay() === dayOfWeek);
                    if (!date) {
                      return <div key={dayOfWeek} className="w-[14px] h-[14px]" />;
                    }

                    const dateStr = date.toISOString().split('T')[0];
                    const checkin = dataMap.get(dateStr);
                    const level = checkin?.level || 0;

                    return (
                      <div
                        key={dayOfWeek}
                        className="w-[14px] h-[14px] rounded-sm cursor-pointer transition-transform hover:scale-125 border border-border"
                        style={{ backgroundColor: getColor(level) }}
                        onMouseEnter={() => setHoveredDay(checkin || { date: dateStr, score: 0, level: 0 })}
                        onMouseLeave={() => setHoveredDay(null)}
                        title={`${date.toLocaleDateString()}: ${checkin ? `Score ${checkin.score.toFixed(1)}` : 'No check-in'}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredDay && (
        <div className="p-3 bg-surface rounded-lg border border-border">
          <div className="text-sm font-medium text-text">
            {new Date(hoveredDay.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="text-lg font-bold text-primary-500 mt-1">
            {hoveredDay.score > 0 ? `Score: ${hoveredDay.score.toFixed(1)}` : 'No check-in'}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className="w-4 h-4 rounded-sm border border-border"
              style={{ backgroundColor: getColor(level) }}
            />
          ))}
        </div>
        <span>More</span>
      </div>

      {/* Accessibility: Text summary */}
      <div className="sr-only">
        Calendar heatmap showing check-in consistency: {stats.checkinDays} check-ins over {stats.totalDays} days ({stats.consistency}% consistency)
      </div>
    </div>
  );
}

