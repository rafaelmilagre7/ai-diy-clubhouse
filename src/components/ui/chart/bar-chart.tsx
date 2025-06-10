
import React from 'react'
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { ChartContainer } from './chart-container'
import { ChartTooltip, ChartTooltipContent } from './chart-tooltip'
import { validateBarChartData } from '@/lib/chart-validation'

interface BarChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  index,
  categories,
  colors = ['#0ABAB5', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
  valueFormatter,
  className
}) => {
  const validation = validateBarChartData(data, index, categories)
  
  if (!validation.isValid) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <p>Dados insuficientes para exibir o gráfico</p>
      </div>
    )
  }

  return (
    <ChartContainer className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={validation.data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey={index}
            className="text-muted-foreground"
            fontSize={12}
          />
          <YAxis className="text-muted-foreground" fontSize={12} />
          <ChartTooltip content={<ChartTooltipContent valueFormatter={valueFormatter} />} />
          <Legend />
          {categories.map((category, idx) => (
            <Bar
              key={category}
              dataKey={category}
              fill={colors[idx % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
