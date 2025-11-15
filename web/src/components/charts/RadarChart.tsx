import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { RadarDataPoint } from '@/api/analytics';

interface Props {
  data: RadarDataPoint[];
  title?: string;
}

export function RadarChart({ data, title }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted">
        No data available for the selected period
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map(d => ({
    dimension: d.dimension,
    score: d.avgScore,
    fullMark: d.maxScore
  }));

  return (
    <div className="w-full space-y-4">
      {title && (
        <h3 className="text-lg font-bold text-text text-center">{title}</h3>
      )}
      
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar data={chartData}>
            <PolarGrid stroke="#374151" strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="dimension" 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              className="text-xs"
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 'auto']}
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
            />
            <Radar
              name="Your Average Score"
              dataKey="score"
              stroke="#DC143C"
              fill="#DC143C"
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}`,
                name
              ]}
              labelStyle={{ color: '#DC143C', fontWeight: 'bold' }}
            />
            <Legend 
              wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }}
            />
          </RechartsRadar>
        </ResponsiveContainer>
      </div>

      {/* Accessibility: Text summary */}
      <div className="sr-only">
        Spider chart showing average scores across dimensions:
        {data.map(d => 
          ` ${d.dimension}: ${d.avgScore.toFixed(1)} out of ${d.maxScore} (${d.checkinCount} check-ins)`
        ).join(',')}
      </div>

      {/* Data Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {data.map((d) => (
          <div 
            key={d.dimensionId} 
            className="p-3 bg-surface rounded-lg border border-border"
          >
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: d.color }}
              />
              <span className="text-sm font-medium text-text">{d.dimension}</span>
            </div>
            <div className="text-2xl font-bold text-primary-500">
              {d.avgScore.toFixed(1)}
            </div>
            <div className="text-xs text-muted">
              of {d.maxScore} max • {d.checkinCount} check-ins
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

