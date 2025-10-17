
import React from 'react'
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { ChartContainer } from './chart-container'
import { ChartTooltip, ChartTooltipContent } from './chart-tooltip'
import { validateBarChartData } from '@/lib/chart-validation'
import { chartColors } from '@/lib/chart-utils'

interface BarChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  className?: string
  layout?: 'horizontal' | 'vertical'
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  index,
  categories,
  colors = chartColors.categorical,
  valueFormatter,
  className,
  layout = 'horizontal'
}) => {
  const validation = validateBarChartData(data, index, categories)
  
  if (!validation.isValid) {
    return (
      <div className="flex items-center justify-center h-chart-md text-muted-foreground">
        <p>Dados insuficientes para exibir o gráfico</p>
      </div>
    )
  }

  return (
    <ChartContainer className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart 
          data={validation.data}
          layout={layout}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          {layout === 'vertical' ? (
            <>
              <XAxis type="number" className="text-muted-foreground" fontSize={12} />
              <YAxis type="category" dataKey={index} className="text-muted-foreground" fontSize={12} width={100} />
            </>
          ) : (
            <>
              <XAxis 
                dataKey={index}
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis className="text-muted-foreground" fontSize={12} />
            </>
          )}
          <Tooltip content={<ChartTooltipContent valueFormatter={valueFormatter} />} />
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
