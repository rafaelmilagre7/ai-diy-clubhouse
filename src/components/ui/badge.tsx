
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
          "border-neutral-400 bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-700",
        destructive:
          "border-transparent bg-destructive/80 text-destructive-foreground hover:bg-destructive/70",
        outline: 
          "border-neutral-500 text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800",
        success: 
          "border-transparent bg-green-100 text-green-900 border-green-400 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/50",
        warning: 
          "border-transparent bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800/50",
        info: 
          "border-transparent bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800/50",
        neutral:
          "border-transparent bg-gray-100 text-gray-900 border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700",
        // Nova variante específica para resumo no tema escuro
        "dark-outline":
          "border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700",
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
