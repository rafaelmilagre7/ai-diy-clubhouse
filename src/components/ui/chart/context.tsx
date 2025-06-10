
import * as React from "react"

export interface ChartConfig {
  [key: string]: {
    label?: string
    color?: string
    theme?: {
      light?: string
      dark?: string
    }
  }
}

export const THEMES = {
  light: "",
  dark: ".dark"
} as const

const ChartContext = React.createContext<ChartConfig | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)
  
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer")
  }
  
  return context
}

export { ChartContext }
