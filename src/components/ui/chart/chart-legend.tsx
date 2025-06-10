
import React from 'react'

interface ChartLegendProps {
  content?: React.ComponentType<any>
}

interface ChartLegendContentProps {
  payload?: any[]
}

export const ChartLegend: React.FC<ChartLegendProps> = ({ content: Content = ChartLegendContent }) => {
  return <Content />
}

export const ChartLegendContent: React.FC<ChartLegendContentProps> = ({ payload }) => {
  if (!payload || !payload.length) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="h-3 w-3 rounded-sm" 
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
