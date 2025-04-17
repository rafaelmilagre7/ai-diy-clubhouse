
import * as React from "react"
import { Area, AreaChart as RechartsAreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface AreaChartProps {
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
  className?: string
}

export function AreaChart({
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
  className,
}: AreaChartProps) {
  const [hoveredValue, setHoveredValue] = React.useState<number | null>(null)

  const formatValue = (value: number) => {
    return valueFormatter(value)
  }

  const customColors = colors || ["var(--color-primary)", "var(--color-secondary)", "var(--color-muted)"]

  return (
    <div className={className || "h-full w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
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
            />
          )}
          <Tooltip
            cursor={false}
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
          {categories.map((category, index) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stackId="1"
              stroke={customColors[index % customColors.length]}
              fill={customColors[index % customColors.length]}
              fillOpacity={0.2}
              activeDot={{
                onMouseOver: (props: any) => setHoveredValue(props.value),
                onMouseLeave: () => setHoveredValue(null),
              }}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
