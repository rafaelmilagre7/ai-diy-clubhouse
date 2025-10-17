
import React from 'react'
import { Area, AreaChart as RechartsAreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { ChartContainer } from './chart-container'
import { ChartTooltip, ChartTooltipContent } from './chart-tooltip'
import { validateAreaChartData } from '@/lib/chart-validation'
import { chartColors } from '@/lib/chart-utils'

interface AreaChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  index,
  categories,
  colors = chartColors.categorical,
  valueFormatter,
  className
}) => {
  const validation = validateAreaChartData(data, index, categories)
  
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
        <RechartsAreaChart data={validation.data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey={index}
            className="text-muted-foreground"
            fontSize={12}
          />
          <YAxis className="text-muted-foreground" fontSize={12} />
          <Tooltip content={<ChartTooltipContent valueFormatter={valueFormatter} />} />
          <Legend />
          {categories.map((category, idx) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[idx % colors.length]}
              fill={colors[idx % colors.length]}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
