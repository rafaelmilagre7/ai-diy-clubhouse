
import * as React from "react";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface BarChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  yAxisWidth?: number;
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGridLines?: boolean;
  layout?: "vertical" | "horizontal";
  className?: string;
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
  className,
}: BarChartProps) {
  const [hoveredValue, setHoveredValue] = React.useState<number | null>(null);

  const formatValue = (value: number) => {
    return valueFormatter(value);
  };

  const customColors = colors || ["var(--color-primary)", "var(--color-secondary)", "var(--color-muted)"];

  return (
    <div className={className || "h-full w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{
            top: 10,
            right: 10,
            left: yAxisWidth,
            bottom: 20,
          }}
        >
          {showGridLines && (
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.8} />
          )}
          {showXAxis && (
            <XAxis
              dataKey={layout === "horizontal" ? index : undefined}
              type={layout === "horizontal" ? "category" : "number"}
              tick={{ fill: "var(--muted-foreground)" }}
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickMargin={10}
              tickFormatter={layout === "horizontal" ? undefined : formatValue}
            />
          )}
          {showYAxis && (
            <YAxis
              dataKey={layout === "vertical" ? index : undefined}
              type={layout === "vertical" ? "category" : "number"}
              width={yAxisWidth}
              tick={{ fill: "var(--muted-foreground)" }}
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickMargin={10}
              tickFormatter={layout === "vertical" ? undefined : formatValue}
            />
          )}
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {payload[0].payload[index]}
                        </p>
                      </div>
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
                );
              }
              return null;
            }}
          />
          {categories.map((category, index) => (
            <Bar
              key={category}
              dataKey={category}
              fill={customColors[index % customColors.length]}
              radius={[4, 4, 0, 0]}
              onMouseOver={(props: any) => setHoveredValue(props.value)}
              onMouseLeave={() => setHoveredValue(null)}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
