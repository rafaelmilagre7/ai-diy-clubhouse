
import * as React from "react"
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { ChartConfig } from "./chart-container"

interface PieChartProps {
  data: any[]
  category: string
  index: string
  colors?: string[]
  valueFormatter?: (value: number) => string
  showLegend?: boolean
  startAngle?: number
  endAngle?: number
  innerRadius?: number
  outerRadius?: number
  paddingAngle?: number
  labelLine?: boolean
  className?: string
}

export function PieChart({
  data,
  category,
  index,
  colors,
  valueFormatter = (value: number) => value.toString(),
  showLegend = true,
  startAngle = 0,
  endAngle = 360,
  innerRadius = 0,
  outerRadius = 80,
  paddingAngle = 0,
  labelLine = true,
  className,
}: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const customColors = colors || ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B", "#6A6AFF", "#FFD700"];

  return (
    <div className={className || "h-full w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 10,
          }}
        >
          <Pie
            data={data}
            dataKey={category}
            nameKey={index}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            labelLine={labelLine}
            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
            onMouseEnter={(_, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={customColors[index % customColors.length]}
                stroke={hoveredIndex === index ? "var(--muted)" : "var(--background)"}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0];
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{data.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {valueFormatter(data.value as number)}
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              content={({ payload }) => {
                if (payload && payload.length) {
                  return (
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                      {payload.map((entry, index) => (
                        <div
                          key={`legend-${index}`}
                          className="flex items-center gap-1"
                        >
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-muted-foreground">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}
