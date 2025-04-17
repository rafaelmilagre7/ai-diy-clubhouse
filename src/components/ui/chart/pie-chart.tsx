
import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"
import { ChartContainer } from "./chart-container"

interface PieChartProps {
  data: any[]
  index: string
  category: string
  colors?: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

export function PieChart({
  data,
  index,
  category,
  colors = ["blue", "green", "red", "yellow", "purple", "indigo", "pink"],
  valueFormatter = (value: number) => `${value}`,
  className,
}: PieChartProps) {
  const config = React.useMemo(() => {
    return data.reduce((acc, dataPoint, idx) => {
      const name = dataPoint[index]
      acc[name] = {
        label: name,
        color: colors[idx % colors.length],
      }
      return acc
    }, {} as Record<string, { label: string; color: string }>)
  }, [data, index, colors])

  return (
    <ChartContainer className={cn("w-full h-full", className)} config={config}>
      <RechartsPrimitive.PieChart className="h-full w-full">
        <RechartsPrimitive.Pie
          data={data}
          dataKey={category}
          nameKey={index}
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={(props) => {
            const { name, value, percent } = props
            return `${name}: ${valueFormatter(value)} (${(percent * 100).toFixed(0)}%)`
          }}
          labelLine={false}
        >
          {data.map((entry) => (
            <RechartsPrimitive.Cell
              key={entry[index]}
              fill={`var(--color-${entry[index]}, ${colors[data.indexOf(entry) % colors.length]})`}
            />
          ))}
        </RechartsPrimitive.Pie>
        <RechartsPrimitive.Tooltip
          formatter={(value: number) => [valueFormatter(value), ""]}
          contentStyle={{ 
            borderRadius: "6px", 
            backgroundColor: "var(--background, #fff)",
            borderColor: "var(--border, #e2e8f0)",
          }}
          labelStyle={{ color: "var(--foreground, #000)" }}
        />
      </RechartsPrimitive.PieChart>
    </ChartContainer>
  )
}
