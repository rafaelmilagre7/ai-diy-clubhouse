
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
          "border-neutral-400 bg-backgroundLight text-neutral-800 hover:bg-background/80", /* Melhor contraste */
        destructive:
          "border-transparent bg-destructive/80 text-destructive-foreground hover:bg-destructive/70",
        outline: 
          "border-neutral-500 text-neutral-800 hover:bg-backgroundLight/80", /* Melhor contraste */
        success: 
          "border-transparent bg-green-100 text-green-800 border-green-400 hover:bg-green-200", /* Melhor contraste */
        warning: 
          "border-transparent bg-amber-100 text-amber-800 border-amber-400 hover:bg-amber-200", /* Melhor contraste */
        info: 
          "border-transparent bg-blue-100 text-blue-800 border-blue-400 hover:bg-blue-200", /* Melhor contraste */
        neutral:
          "border-transparent bg-gray-100 text-gray-800 border-gray-400 hover:bg-gray-200", /* Melhor contraste */
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
