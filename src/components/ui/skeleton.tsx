
import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-surface-elevated/60 to-surface-hover/40 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
