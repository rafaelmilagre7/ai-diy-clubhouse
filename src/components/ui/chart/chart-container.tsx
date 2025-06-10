
import React from 'react'
import { ChartConfig, ChartContext } from './context'
import { ChartStyle } from './chart-style'

interface ChartContainerProps {
  config?: ChartConfig
  children: React.ReactNode
  className?: string
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  config = {},
  children,
  className
}) => {
  return (
    <ChartContext.Provider value={config}>
      <div className={className}>
        {children}
      </div>
    </ChartContext.Provider>
  )
}

export { ChartStyle }
export type { ChartConfig }
