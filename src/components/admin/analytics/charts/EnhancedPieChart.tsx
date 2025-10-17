import React from 'react';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import { ChartTooltip } from './ChartTooltip';
import { chartTheme, getChartColor } from './chartTheme';

interface EnhancedPieChartProps {
  data: any[];
  title: string;
  description?: string;
  category: string;
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  loading?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
}

export const EnhancedPieChart: React.FC<EnhancedPieChartProps> = ({
  data,
  title,
  description,
  category,
  index,
  colors,
  valueFormatter,
  loading = false,
  className,
  size = 'medium',
  showLegend = true,
  innerRadius = 60,
  outerRadius = 120,
  startAngle = 90,
  endAngle = -270
}) => {
  // Validação de dados
  if (!loading && (!data || data.length === 0)) {
    return (
      <ChartContainer title={title} description={description} size={size} className={className}>
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <p>Sem dados disponíveis para exibição</p>
          </div>
        </div>
      </ChartContainer>
    );
  }

  const chartColors = colors || data.map((_, index) => getChartColor(index));

  // Calcular total para percentuais
  const total = data.reduce((sum, item) => sum + (item[category] || 0), 0);
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: total > 0 ? ((item[category] || 0) / total * 100).toFixed(1) : 0
  }));

  const customValueFormatter = (value: number) => {
    const percentage = total > 0 ? (value / total * 100).toFixed(1) : 0;
    return `${valueFormatter ? valueFormatter(value) : value.toLocaleString()} (${percentage}%)`;
  };

  return (
    <ChartContainer 
      title={title} 
      description={description} 
      loading={loading} 
      size={size}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey={category}
            nameKey={index}
            startAngle={startAngle}
            endAngle={endAngle}
            animationDuration={chartTheme.animations.duration}
          >
            {dataWithPercentage.map((entry, idx) => (
              <Cell 
                key={`cell-${idx}`} 
                fill={chartColors[idx]}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
            ))}
          </Pie>
          
          <Tooltip 
            content={
              <ChartTooltip 
                valueFormatter={customValueFormatter}
              />
            }
          />
          
          {showLegend && (
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">
                  {value}
                </span>
              )}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
