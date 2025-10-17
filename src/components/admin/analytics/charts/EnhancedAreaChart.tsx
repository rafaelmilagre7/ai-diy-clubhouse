import React from 'react';
import { 
  AreaChart as RechartsAreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import { ChartTooltip } from './ChartTooltip';
import { chartTheme, getChartColor } from './chartTheme';

interface EnhancedAreaChartProps {
  data: any[];
  title: string;
  description?: string;
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
  loading?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showLegend?: boolean;
  curved?: boolean;
}

export const EnhancedAreaChart: React.FC<EnhancedAreaChartProps> = ({
  data,
  title,
  description,
  categories,
  index,
  colors,
  valueFormatter,
  labelFormatter,
  loading = false,
  className,
  size = 'medium',
  showLegend = true,
  curved = true
}) => {
  // Validação de dados
  if (!loading && (!data || data.length === 0)) {
    return (
      <ChartContainer title={title} description={description} size={size} className={className}>
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <p>Sem dados disponíveis para exibição</p>
          </div>
        </div>
      </ChartContainer>
    );
  }

  const chartColors = colors || categories.map((_, index) => getChartColor(index));

  return (
    <ChartContainer 
      title={title} 
      description={description} 
      loading={loading} 
      size={size}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={chartTheme.responsive[size].margin}
        >
          <defs>
            {categories.map((category, idx) => (
              <linearGradient key={category} id={`gradient-${category}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors[idx]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartColors[idx]} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          
          <CartesianGrid {...chartTheme.styles.grid} />
          
          <XAxis
            dataKey={index}
            {...chartTheme.styles.axis}
            tickFormatter={labelFormatter}
          />
          
          <YAxis
            {...chartTheme.styles.axis}
            tickFormatter={valueFormatter}
          />
          
          <Tooltip 
            content={
              <ChartTooltip 
                valueFormatter={valueFormatter}
                labelFormatter={labelFormatter}
              />
            }
          />
          
          {showLegend && <Legend />}
          
          {categories.map((category, idx) => (
            <Area
              key={category}
              type={curved ? "monotone" : "linear"}
              dataKey={category}
              stroke={chartColors[idx]}
              fill={`url(#gradient-${category})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 6, 
                stroke: chartColors[idx], 
                strokeWidth: 2, 
                fill: 'hsl(var(--background))' 
              }}
              animationDuration={chartTheme.animations.duration}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
