
import * as React from "react";
import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  Sector, 
  TooltipProps
} from "recharts";
import { chartColors, chartTypeConfig } from "@/lib/chart-utils";

interface PieChartProps {
  data: any[];
  category: string;
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  startAngle?: number;
  endAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  labelLine?: boolean;
  className?: string;
}

export function PieChart({
  data,
  category,
  index,
  colors,
  valueFormatter = (value: number) => value.toString(),
  showLegend = true,
  startAngle = 90,
  endAngle = -270,
  innerRadius = 60,
  outerRadius = 90,
  paddingAngle = 2,
  labelLine = false,
  className,
}: PieChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  
  // Usar cores personalizadas ou padrão
  const customColors = colors || chartColors.categorical;
  
  // Renderizador personalizado para fatia ativa
  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      value,
    } = props;

    return (
      <g>
        {/* Fatia ativa com efeito de elevação */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          cornerRadius={4}
          stroke="#fff"
          strokeWidth={2}
        />
        
        {/* Linha externa */}
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 12}
          fill={fill}
          cornerRadius={2}
        />
        
        {/* Texto no centro da fatia */}
        <text
          x={cx}
          y={cy - 10}
          dy={8}
          textAnchor="middle"
          fill={fill}
          className="text-sm font-semibold"
        >
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy + 10}
          dy={8}
          textAnchor="middle"
          fill="var(--muted-foreground)"
          className="text-xs"
        >
          {valueFormatter(value)}
        </text>
      </g>
    );
  };
  
  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0];
      return (
        <div className="rounded-lg border bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.payload.fill || data.color }}
            />
            <span className="font-medium">{data.name}</span>
          </div>
          <div className="mt-1 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Valor: </span>
            <span className="font-medium">{valueFormatter(data.value as number)}</span>
          </div>
          {data.payload.percentage && (
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Porcentagem: </span>
              <span className="font-medium">
                {typeof data.payload.percentage === 'number' 
                  ? `${data.payload.percentage.toFixed(1)}%` 
                  : data.payload.percentage}
              </span>
            </div>
          )}
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
            className="flex items-center gap-2 cursor-pointer transition-all duration-300"
            style={{ 
              opacity: activeIndex === null || activeIndex === index ? 1 : 0.5,
            }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {entry.value}
              {entry.payload && entry.payload.percentage && 
                ` (${typeof entry.payload.percentage === 'number' 
                  ? `${entry.payload.percentage.toFixed(1)}%` 
                  : entry.payload.percentage})`
              }
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Adicionar porcentagens aos dados
  const dataWithPercentages = React.useMemo(() => {
    const total = data.reduce((sum, item) => sum + (item[category] || 0), 0);
    return data.map(item => ({
      ...item,
      percentage: total > 0 ? ((item[category] / total) * 100) : 0
    }));
  }, [data, category]);

  return (
    <div className={className || "h-full w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart
          margin={{
            top: 20,
            right: 20,
            left: 20,
            bottom: 20,
          }}
        >
          <Pie
            data={dataWithPercentages}
            dataKey={category}
            nameKey={index}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            labelLine={labelLine}
            activeIndex={activeIndex !== null ? activeIndex : undefined}
            activeShape={renderActiveShape}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
            cornerRadius={4}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {dataWithPercentages.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={customColors[index % customColors.length]}
                stroke="#fff"
                strokeWidth={activeIndex === index ? 2 : 1}
                style={{
                  filter: activeIndex === index 
                    ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))' 
                    : 'none',
                  transition: "filter 300ms, stroke-width 300ms"
                }}
              />
            ))}
          </Pie>
          
          <Tooltip content={<CustomTooltip />} />
          
          {showLegend && (
            <Legend 
              content={<CustomLegend />}
              verticalAlign="bottom"
              align="center"
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}
