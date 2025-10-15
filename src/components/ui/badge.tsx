import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-aurora focus:ring-offset-2 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "border-aurora/30 bg-aurora/10 text-aurora hover:bg-aurora/20",
        secondary:
          "border-viverblue/30 bg-viverblue/10 text-viverblue hover:bg-viverblue/20",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20",
        outline: "border-aurora/20 text-foreground hover:bg-aurora/5",
        success:
          "border-operational/30 bg-operational/10 text-operational hover:bg-operational/20",
        warning:
          "border-revenue/30 bg-revenue/10 text-revenue hover:bg-revenue/20",
        info:
          "border-viverblue/30 bg-viverblue/10 text-viverblue hover:bg-viverblue/20",
        neutral:
          "border-border bg-muted text-muted-foreground hover:bg-muted/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }