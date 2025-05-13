
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
          "border-transparent bg-destructive/80 text-destructive-foreground hover:bg-destructive/70",
        outline: 
          "border-white/10 text-textPrimary hover:bg-backgroundLight/80",
        success: 
          "border-transparent bg-green-900/30 text-green-300 border-green-800/30 hover:bg-green-900/40",
        warning: 
          "border-transparent bg-amber-900/30 text-amber-300 border-amber-800/30 hover:bg-amber-900/40",
        info: 
          "border-transparent bg-blue-900/30 text-blue-300 border-blue-800/30 hover:bg-blue-900/40",
        neutral:
          "border-transparent bg-gray-800/50 text-gray-300 border-gray-700/30 hover:bg-gray-800/60",
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
