
import * as React from "react"
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Legend } from "recharts"
import { ChartConfig } from "./chart-container"

interface BarChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  yAxisWidth?: number
  showLegend?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGridLines?: boolean
  layout?: "horizontal" | "vertical"
  stack?: boolean
  className?: string
}

export function BarChart({
  data,
  index,
  categories,
  colors,
  valueFormatter = (value: number) => value.toString(),
  yAxisWidth = 40,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGridLines = true,
  layout = "horizontal",
  stack = false,
  className,
}: BarChartProps) {
  const [hoveredValue, setHoveredValue] = React.useState<number | null>(null)

  const formatValue = (value: number) => {
    return valueFormatter(value)
  }

  const customColors = colors || ["var(--color-primary)", "var(--color-secondary)", "var(--color-muted)"]

  return (
    <div className={className || "h-full w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          {showGridLines && (
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.8} />
          )}
          {showXAxis && (
            <XAxis
              dataKey={index}
              tick={{ fill: "var(--muted-foreground)" }}
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickMargin={10}
              type={layout === "horizontal" ? "category" : "number"}
            />
          )}
          {showYAxis && (
            <YAxis
              width={yAxisWidth}
              tickFormatter={formatValue}
              tick={{ fill: "var(--muted-foreground)" }}
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickMargin={10}
              type={layout === "horizontal" ? "number" : "category"}
            />
          )}
          <Tooltip
            cursor={{ fill: "var(--accent)" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      {payload.map((entry, index) => (
                        <div key={`tooltip-${index}`}>
                          <p className="text-xs text-muted-foreground">
                            {entry.name}
                          </p>
                          <p
                            className="text-sm font-medium"
                            style={{ color: entry.color }}
                          >
                            {valueFormatter(entry.value as number)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          {showLegend && (
            <Legend
              verticalAlign="top"
              height={36}
              content={({ payload }) => {
                if (payload && payload.length) {
                  return (
                    <div className="flex items-center justify-center gap-4">
                      {payload.map((entry, index) => (
                        <div
                          key={`legend-${index}`}
                          className="flex items-center gap-1"
                        >
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                }
                return null
              }}
            />
          )}
          {categories.map((category, index) => (
            <Bar
              key={category}
              dataKey={category}
              stackId={stack ? "a" : undefined}
              fill={customColors[index % customColors.length]}
              radius={[4, 4, 0, 0]}
              onMouseOver={(props: any) => setHoveredValue(props.value)}
              onMouseLeave={() => setHoveredValue(null)}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
