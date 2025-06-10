
import React from 'react'

interface ChartTooltipProps {
  content?: React.ComponentType<any>
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  label?: string
  valueFormatter?: (value: number) => string
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({ content: Content = ChartTooltipContent }) => {
  return <Content />
}

export const ChartTooltipContent: React.FC<ChartTooltipContentProps> = ({
  active,
  payload,
  label,
  valueFormatter = (value) => value.toString()
}) => {
  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        {label && (
          <div className="font-medium text-foreground">
            {label}
          </div>
        )}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {valueFormatter(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
