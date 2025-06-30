
import React from 'react';
import { chartTheme } from './chartTheme';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
  colorMap?: Record<string, string>;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  valueFormatter = (value) => value.toLocaleString(),
  labelFormatter = (label) => label,
  colorMap = {}
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div 
      className="bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-lg p-3 max-w-xs"
      style={{
        backgroundColor: 'hsl(var(--card) / 0.95)',
        borderColor: 'hsl(var(--border))',
        color: 'hsl(var(--card-foreground))'
      }}
    >
      {label && (
        <div className="font-medium text-card-foreground mb-2 text-sm">
          {labelFormatter(label)}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ 
                  backgroundColor: colorMap[entry.dataKey] || entry.color 
                }}
              />
              <span className="text-muted-foreground text-sm">
                {entry.name || entry.dataKey}
              </span>
            </div>
            <span className="font-medium text-card-foreground text-sm">
              {valueFormatter(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Tooltip especializado para gráficos de área
export const AreaChartTooltip: React.FC<ChartTooltipProps> = (props) => {
  return (
    <ChartTooltip
      {...props}
      valueFormatter={(value) => `${value.toLocaleString()} usuários`}
    />
  );
};

// Tooltip especializado para gráficos de barra
export const BarChartTooltip: React.FC<ChartTooltipProps> = (props) => {
  return (
    <ChartTooltip
      {...props}
      valueFormatter={(value) => `${value.toLocaleString()} implementações`}
    />
  );
};

// Tooltip especializado para gráficos de pizza
export const PieChartTooltip: React.FC<ChartTooltipProps> = (props) => {
  return (
    <ChartTooltip
      {...props}
      valueFormatter={(value) => `${value.toLocaleString()} (${((value / props.payload?.[0]?.payload?.total) * 100 || 0).toFixed(1)}%)`}
    />
  );
};
