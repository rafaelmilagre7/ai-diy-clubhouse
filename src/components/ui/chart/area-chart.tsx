
import * as React from "react"
import { Area, AreaChart as RechartsAreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Dot, TooltipProps } from "recharts"
import { chartColors } from "@/lib/chart-utils"

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
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [hoveredValue, setHoveredValue] = React.useState<number | null>(null);
  
  // Usar cores padronizadas ou as cores fornecidas
  const customColors = colors || [chartColors.primary, chartColors.secondary, chartColors.success];
  
  // Componente personalizado para pontos ativos com animação
  const CustomActiveDot = (props: any) => {
    const { cx, cy, value } = props;
    
    React.useEffect(() => {
      setHoveredValue(value);
    }, [value]);
    
    return (
      <Dot
        cx={cx}
        cy={cy}
        r={6}
        stroke={customColors[0]}
        strokeWidth={2}
        fill="#fff"
        className="animate-pulse"
      />
    );
  };
  
  // Tooltip personalizado com estilo melhorado
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 shadow-lg">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</p>
          <div className="grid gap-1">
            {payload.map((entry, index) => (
              <div key={`tooltip-${index}`} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {entry.name}:
                </span>
                <span className="text-sm font-medium" style={{ color: entry.color }}>
                  {valueFormatter(entry.value as number)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Legenda personalizada
  const CustomLegend = ({ payload }: any) => {
    if (!showLegend) return null;
    
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div 
            key={`legend-${index}`} 
            className="flex items-center gap-2 cursor-pointer transition-opacity duration-300"
            style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.5 }}
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={className || "h-full w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 0,
            bottom: 0,
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {showGridLines && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--border)" 
              strokeOpacity={0.4} 
              vertical={false}
            />
          )}
          
          {showXAxis && (
            <XAxis
              dataKey={index}
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickMargin={10}
              padding={{ left: 10, right: 10 }}
              tick={({ x, y, payload }) => (
                <text
                  x={x}
                  y={y + 10}
                  textAnchor="middle"
                  fill="var(--muted-foreground)"
                  fontSize={12}
                >
                  {payload.value}
                </text>
              )}
            />
          )}
          
          {showYAxis && (
            <YAxis
              width={yAxisWidth}
              tickFormatter={valueFormatter}
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickMargin={10}
              domain={['auto', 'auto']}
              tick={({ x, y, payload }) => (
                <text
                  x={x - 10}
                  y={y}
                  textAnchor="end"
                  fill="var(--muted-foreground)"
                  fontSize={12}
                >
                  {valueFormatter(payload.value)}
                </text>
              )}
            />
          )}
          
          <Tooltip content={<CustomTooltip />} />
          
          {showLegend && (
            <Legend content={<CustomLegend />} />
          )}
          
          {categories.map((category, index) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              name={category}
              stroke={customColors[index % customColors.length]}
              fill={customColors[index % customColors.length] + '20'}
              fillOpacity={0.8}
              strokeWidth={2}
              dot={false}
              activeDot={<CustomActiveDot />}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-in-out"
              style={{
                filter: "drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))",
                opacity: activeIndex === null || activeIndex === index ? 1 : 0.3,
                transition: "opacity 300ms"
              }}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
