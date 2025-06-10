
import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-t p-4 mt-auto", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"

export { SidebarFooter }
