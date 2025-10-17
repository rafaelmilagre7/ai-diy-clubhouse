import React from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
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

interface EnhancedBarChartProps {
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
  layout?: 'horizontal' | 'vertical';
  barRadius?: number;
}

export const EnhancedBarChart: React.FC<EnhancedBarChartProps> = ({
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
  layout = 'horizontal',
  barRadius = 4
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
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={chartTheme.responsive[size].margin}
        >
          <defs>
            {categories.map((category, idx) => (
              <linearGradient key={category} id={`bar-gradient-${category}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors[idx]} stopOpacity={1}/>
                <stop offset="100%" stopColor={chartColors[idx]} stopOpacity={0.8}/>
              </linearGradient>
            ))}
          </defs>
          
          <CartesianGrid {...chartTheme.styles.grid} />
          
          {layout === 'horizontal' ? (
            <>
              <XAxis
                dataKey={index}
                {...chartTheme.styles.axis}
                tickFormatter={labelFormatter}
              />
              <YAxis
                {...chartTheme.styles.axis}
                tickFormatter={valueFormatter}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                {...chartTheme.styles.axis}
                tickFormatter={valueFormatter}
              />
              <YAxis
                type="category"
                dataKey={index}
                {...chartTheme.styles.axis}
                tickFormatter={labelFormatter}
                width={100}
              />
            </>
          )}
          
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
            <Bar
              key={category}
              dataKey={category}
              fill={`url(#bar-gradient-${category})`}
              radius={barRadius}
              animationDuration={chartTheme.animations.duration}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
