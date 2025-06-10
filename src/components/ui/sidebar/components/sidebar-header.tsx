
import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-b p-4", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

export { SidebarHeader }
