
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: ChartConfig
}

const ChartContext = React.createContext<ChartConfig | undefined>(undefined)

export function ChartContainer({
  children,
  config,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <ChartContext.Provider value={config}>
      <div className={cn("", className)} {...props}>
        {children}
      </div>
      <ChartStyle config={config} />
    </ChartContext.Provider>
  )
}

export function useConfig() {
  const config = React.useContext(ChartContext)
  return config
}

export function ChartStyle({ config }: { config?: ChartConfig }) {
  if (!config) {
    return null
  }

  // Fix: Remove JSX style props and use dangerouslySetInnerHTML instead
  return (
    <style dangerouslySetInnerHTML={{
      __html: Object.entries(config)
        .map(([key, value]) => {
          return `--color-${key}: ${value.color};`
        })
        .join("\n")
    }} />
  )
}
