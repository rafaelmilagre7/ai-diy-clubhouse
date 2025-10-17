
import React from 'react';
import { 
  Area, 
  AreaChart as RechartsAreaChart, 
  Bar, 
  BarChart as RechartsBarChart,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { validateChartData, formatChartData, chartColors } from '@/lib/chart-utils';

interface BaseChartProps {
  data: any[];
  className?: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
}

interface AreaChartProps extends BaseChartProps {
  index: string;
  categories: string[];
}

interface BarChartProps extends BaseChartProps {
  index: string;
  categories: string[];
  layout?: 'horizontal' | 'vertical';
}

interface PieChartProps extends BaseChartProps {
  category: string;
  index: string;
}

// Componente de fallback para quando não há dados
const ChartFallback = ({ message = "Sem dados disponíveis" }: { message?: string }) => (
  <div className="flex items-center justify-center h-full w-full min-h-[200px] text-neutral-500 dark:text-neutral-400">
    <div className="text-center">
      <div className="text-lg mb-2">📊</div>
      <p>{message}</p>
    </div>
  </div>
);

export const AreaChart: React.FC<AreaChartProps> = ({ 
  data, 
  index, 
  categories, 
  colors = [chartColors.primary], 
  valueFormatter = (value) => value.toString(),
  showLegend = false,
  className = ""
}) => {
  // Validar dados
  const validData = formatChartData(data);
  
  if (!validateChartData(validData, [index, ...categories])) {
    return <ChartFallback message="Dados insuficientes para o gráfico de área" />;
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={validData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {colors.map((color, index) => (
              <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey={index} 
            stroke="hsl(var(--text-muted))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--text-muted))"
            fontSize={12}
            tickFormatter={valueFormatter}
          />
          <Tooltip 
            formatter={(value: number) => [valueFormatter(value), '']}
            labelStyle={{ color: 'hsl(var(--text-muted))' }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          {showLegend && <Legend />}
          {categories.map((category, idx) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[idx] || chartColors.primary}
              fill={`url(#gradient${idx})`}
              strokeWidth={2}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  index, 
  categories, 
  colors = [chartColors.primary], 
  valueFormatter = (value) => value.toString(),
  showLegend = false,
  layout = 'vertical',
  className = ""
}) => {
  const validData = formatChartData(data);
  
  if (!validateChartData(validData, [index, ...categories])) {
    return <ChartFallback message="Dados insuficientes para o gráfico de barras" />;
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart 
          data={validData} 
          layout={layout}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          {layout === 'vertical' ? (
            <>
              <XAxis type="number" stroke="hsl(var(--text-muted))" fontSize={12} tickFormatter={valueFormatter} />
              <YAxis type="category" dataKey={index} stroke="hsl(var(--text-muted))" fontSize={12} width={100} />
            </>
          ) : (
            <>
              <XAxis dataKey={index} stroke="hsl(var(--text-muted))" fontSize={12} />
              <YAxis stroke="hsl(var(--text-muted))" fontSize={12} tickFormatter={valueFormatter} />
            </>
          )}
          <Tooltip 
            formatter={(value: number) => [valueFormatter(value), '']}
            labelStyle={{ color: 'hsl(var(--text-muted))' }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          {showLegend && <Legend />}
          {categories.map((category, idx) => (
            <Bar 
              key={category}
              dataKey={category} 
              fill={colors[idx] || chartColors.primary}
              radius={4}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  category, 
  index,
  colors = chartColors.categorical,
  valueFormatter = (value) => value.toString(),
  className = ""
}) => {
  const validData = formatChartData(data);
  
  if (!validateChartData(validData, [category, index])) {
    return <ChartFallback message="Dados insuficientes para o gráfico de pizza" />;
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={validData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={5}
            dataKey={category}
            nameKey={index}
          >
            {validData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [valueFormatter(value), '']}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
