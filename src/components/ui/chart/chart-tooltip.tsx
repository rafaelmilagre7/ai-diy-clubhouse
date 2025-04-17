
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ChartTooltip({ className, ...props }: ChartTooltipProps) {
  return (
    <div
      className={cn(
        "bg-background text-muted-foreground border border-border rounded-md p-2 shadow-sm text-xs",
        className
      )}
      {...props}
    />
  )
}

export function ChartTooltipContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-0.5", className)} {...props} />
}
