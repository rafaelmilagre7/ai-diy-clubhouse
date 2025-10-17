
import React from 'react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { ChartContainer } from './chart-container'
import { ChartTooltip, ChartTooltipContent } from './chart-tooltip'
import { validatePieChartData } from '@/lib/chart-validation'
import { chartColors } from '@/lib/chart-utils'

interface PieChartProps {
  data: any[]
  index: string
  category: string
  colors?: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  index,
  category,
  colors = chartColors.categorical,
  valueFormatter,
  className
}) => {
  const validation = validatePieChartData(data, index, category)
  
  if (!validation.isValid) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        <p>Dados insuficientes para exibir o gráfico</p>
      </div>
    )
  }

  return (
    <ChartContainer className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={validation.data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="hsl(var(--aurora-primary))"
            dataKey={category}
            nameKey={index}
          >
            {validation.data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltipContent valueFormatter={valueFormatter} />} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
