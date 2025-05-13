
import * as React from "react";
import { 
  Bar, 
  BarChart as RechartsBarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend,
  TooltipProps,
  Cell
} from "recharts";
import { chartColors, chartConfig, getChartGradient } from "@/lib/chart-utils";

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
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = React.useState<number | null>(null);

  // Usar cores personalizadas ou padrão
  const customColors = colors || chartColors.categorical;

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
                  {entry.name || categories[index]}:
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
            style={{ opacity: activeCategoryIndex === null || activeCategoryIndex === index ? 1 : 0.5 }}
            onClick={() => setActiveCategoryIndex(activeCategoryIndex === index ? null : index)}
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
      {/* Definindo gradientes reutilizáveis */}
      <svg width="0" height="0" className="absolute">
        {getChartGradient(chartColors.barGradient.id, chartColors.barGradient.colors)}
      </svg>
      
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{
            top: 20,
            right: 20,
            left: yAxisWidth,
            bottom: 20,
          }}
          onMouseLeave={() => {
            setActiveIndex(null);
            setActiveCategoryIndex(null);
          }}
        >
          {showGridLines && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--border)" 
              strokeOpacity={0.4}
              vertical={layout === "horizontal" ? false : true}
              horizontal={layout === "horizontal" ? true : false}
            />
          )}
          
          {showXAxis && (
            <XAxis
              dataKey={layout === "horizontal" ? index : undefined}
              type={layout === "horizontal" ? "category" : "number"}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickMargin={10}
              angle={layout === "horizontal" && data.length > 5 ? -45 : 0}
              textAnchor={layout === "horizontal" && data.length > 5 ? "end" : "middle"}
              height={layout === "horizontal" && data.length > 5 ? 70 : 50}
              tickFormatter={layout === "horizontal" ? undefined : valueFormatter}
              interval={0}
            />
          )}
          
          {showYAxis && (
            <YAxis
              dataKey={layout === "vertical" ? index : undefined}
              type={layout === "vertical" ? "category" : "number"}
              width={layout === "vertical" ? 120 : yAxisWidth}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickMargin={10}
              tickFormatter={layout === "vertical" ? undefined : valueFormatter}
              domain={['auto', 'auto']}
            />
          )}
          
          <Tooltip content={<CustomTooltip />} />
          
          {showLegend && (
            <Legend content={<CustomLegend />} />
          )}
          
          {categories.map((category, categoryIdx) => (
            <Bar
              key={category}
              dataKey={category}
              name={category}
              fill={customColors[categoryIdx % customColors.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
              animationDuration={1000}
              animationEasing="ease-in-out"
              isAnimationActive={true}
              style={{
                opacity: activeCategoryIndex === null || activeCategoryIndex === categoryIdx ? 1 : 0.3,
                transition: "opacity 300ms"
              }}
              onMouseOver={() => setActiveCategoryIndex(categoryIdx)}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === activeIndex 
                    ? customColors[categoryIdx % customColors.length] 
                    : `url(#${chartColors.barGradient.id})`
                  }
                  className="transition-all duration-300 hover:brightness-110"
                  style={{ 
                    filter: index === activeIndex ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' : 'none',
                    transform: index === activeIndex ? 'translateY(-2px)' : 'none'
                  }}
                  onMouseOver={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                />
              ))}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
