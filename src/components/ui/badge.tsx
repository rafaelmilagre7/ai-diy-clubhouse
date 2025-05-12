
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-viverblue text-white hover:bg-viverblue-dark",
        secondary:
          "border-white/10 bg-backgroundLight text-textSecondary hover:bg-background/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-white/10",
        success: 
          "border-transparent bg-green-900/30 text-green-300 hover:bg-green-900/40",
        warning: 
          "border-transparent bg-amber-900/30 text-amber-300 hover:bg-amber-900/40",
        info: 
          "border-transparent bg-blue-900/30 text-blue-300 hover:bg-blue-900/40",
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
