
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { chartColors } from '@/lib/chart-utils';

interface SparklineData {
  value: number;
  date?: string;
}

interface MiniSparklineProps {
  data: SparklineData[];
  color?: string;
  height?: number;
  strokeWidth?: number;
  className?: string;
}

export const MiniSparkline = ({ 
  data, 
  color = chartColors.primary,
  height = 40,
  strokeWidth = 2,
  className 
}: MiniSparklineProps) => {
  if (!data || data.length === 0) {
    return (
      <div 
        className={`bg-gray-100 dark:bg-gray-800 rounded ${className}`}
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full text-xs text-gray-400">
          Sem dados
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={strokeWidth}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
