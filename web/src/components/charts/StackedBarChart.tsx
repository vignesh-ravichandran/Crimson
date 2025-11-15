import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { StackedBarDataPoint } from '@/api/analytics';

interface Props {
  data: StackedBarDataPoint[];
  dimensions: string[];
  colors: Record<string, string>;
  title?: string;
}

export function StackedBarChart({ data, dimensions, colors, title }: Props) {
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
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              label={{ 
                value: 'Score', 
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
              formatter={(value: number) => value.toFixed(1)}
              labelStyle={{ color: '#DC143C', fontWeight: 'bold', marginBottom: '8px' }}
            />
            <Legend 
              wrapperStyle={{ color: '#9CA3AF', fontSize: '12px', paddingTop: '20px' }}
            />
            {dimensions.map((dim, idx) => (
              <Bar
                key={dim}
                dataKey={dim}
                stackId="a"
                fill={colors[dim]}
                radius={idx === dimensions.length - 1 ? [4, 4, 0, 0] : 0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accessibility: Text summary */}
      <div className="sr-only">
        Stacked bar chart showing daily breakdown by dimensions:
        {data.map(d => 
          ` ${d.formattedDate}: Total ${d.total} (${dimensions.map(dim => `${dim}: ${d[dim]}`).join(', ')})`
        ).join(';')}
      </div>

      {/* Dimension Legend with Totals */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {dimensions.map(dim => {
          const total = data.reduce((sum, d) => sum + (Number(d[dim]) || 0), 0);
          const avg = total / data.length;
          
          return (
            <div 
              key={dim}
              className="p-3 bg-surface rounded-lg border border-border"
            >
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors[dim] }}
                />
                <span className="text-sm font-medium text-text">{dim}</span>
              </div>
              <div className="text-lg font-bold text-primary-500">
                {avg.toFixed(1)}
              </div>
              <div className="text-xs text-muted">
                avg per day
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

