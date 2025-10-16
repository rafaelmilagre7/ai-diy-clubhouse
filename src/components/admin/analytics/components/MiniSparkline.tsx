
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniSparklineProps {
  data: Array<{ value: number; date?: string }>;
  color?: string;
  height?: number;
  className?: string;
}

export const MiniSparkline = ({ 
  data, 
  color = 'hsl(var(--aurora-primary))', 
  height = 40,
  className = '' 
}: MiniSparklineProps) => {
  if (!data || data.length === 0) {
    return (
      <div className={`h-${height} bg-muted/20 rounded ${className}`} 
           style={{ height: `${height}px` }} />
    );
  }

  return (
    <div className={className} style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
