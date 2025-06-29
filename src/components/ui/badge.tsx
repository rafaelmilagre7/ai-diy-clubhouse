
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Adicionando novas variantes
        info: 
          "border-transparent bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
        success: 
          "border-transparent bg-green-500/20 text-green-500 hover:bg-green-500/30",
        warning: 
          "border-transparent bg-amber-500/20 text-amber-500 hover:bg-amber-500/30",
        neutral: 
          "border-transparent bg-gray-200/20 text-gray-200 hover:bg-gray-200/30",
        "dark-outline": 
          "bg-transparent border-gray-700 text-gray-200 hover:bg-gray-800",
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
