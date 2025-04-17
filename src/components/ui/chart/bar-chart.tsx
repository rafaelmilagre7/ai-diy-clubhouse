
import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"
import { ChartContainer } from "./chart-container"

interface BarChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

export function BarChart({
  data,
  index,
  categories,
  colors = ["blue", "green", "red", "yellow", "purple", "indigo", "pink"],
  valueFormatter = (value: number) => `${value}`,
  className,
}: BarChartProps) {
  const config = React.useMemo(() => {
    return categories.reduce((acc, category, idx) => {
      acc[category] = {
        label: category,
        color: colors[idx % colors.length],
      }
      return acc
    }, {} as Record<string, { label: string; color: string }>)
  }, [categories, colors])

  return (
    <ChartContainer className={cn("w-full h-full", className)} config={config}>
      <RechartsPrimitive.BarChart data={data} className="h-full w-full">
        <RechartsPrimitive.XAxis
          dataKey={index}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <RechartsPrimitive.YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
        />
        <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" vertical={false} />
        <RechartsPrimitive.Tooltip
          formatter={(value: number) => [valueFormatter(value), ""]}
          contentStyle={{ 
            borderRadius: "6px", 
            backgroundColor: "var(--background, #fff)",
            borderColor: "var(--border, #e2e8f0)",
          }}
          labelStyle={{ color: "var(--foreground, #000)" }}
        />
        {categories.map((category, idx) => (
          <RechartsPrimitive.Bar
            key={category}
            dataKey={category}
            fill={`var(--color-${category}, ${colors[idx % colors.length]})`}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsPrimitive.BarChart>
    </ChartContainer>
  )
}
