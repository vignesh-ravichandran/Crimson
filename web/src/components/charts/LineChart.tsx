import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LineDataPoint } from '@/api/analytics';

interface Props {
  data: LineDataPoint[];
  title?: string;
}

export function LineChart({ data, title }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted">
        No data available for the selected period
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {title && (
        <h3 className="text-lg font-bold text-text text-center">{title}</h3>
      )}
      
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLine data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              label={{ 
                value: 'Total Score', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#9CA3AF', fontSize: 12 }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value: number) => [value.toFixed(1), 'Score']}
              labelStyle={{ color: '#DC143C', fontWeight: 'bold' }}
            />
            <Legend 
              wrapperStyle={{ color: '#9CA3AF', fontSize: '12px', paddingTop: '20px' }}
            />
            <Line
              type="monotone"
              dataKey="score"
              name="Total Score"
              stroke="#DC143C"
              strokeWidth={3}
              dot={{ fill: '#DC143C', r: 4 }}
              activeDot={{ r: 6, fill: '#8B0000' }}
            />
          </RechartsLine>
        </ResponsiveContainer>
      </div>

      {/* Accessibility: Text summary */}
      <div className="sr-only">
        Line chart showing score trend over time:
        {data.map(d => ` ${d.formattedDate}: ${d.score.toFixed(1)}`).join(',')}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="p-3 bg-surface rounded-lg border border-border text-center">
          <div className="text-xs text-muted mb-1">Average</div>
          <div className="text-2xl font-bold text-primary-500">
            {(data.reduce((sum, d) => sum + d.score, 0) / data.length).toFixed(1)}
          </div>
        </div>
        <div className="p-3 bg-surface rounded-lg border border-border text-center">
          <div className="text-xs text-muted mb-1">Highest</div>
          <div className="text-2xl font-bold text-green-500">
            {Math.max(...data.map(d => d.score)).toFixed(1)}
          </div>
        </div>
        <div className="p-3 bg-surface rounded-lg border border-border text-center">
          <div className="text-xs text-muted mb-1">Lowest</div>
          <div className="text-2xl font-bold text-orange-500">
            {Math.min(...data.map(d => d.score)).toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}

