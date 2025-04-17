
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChartLegendProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ChartLegend({ className, ...props }: ChartLegendProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-4 text-sm", className)}
      {...props}
    />
  )
}

export function ChartLegendContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-1", className)} {...props} />
}
