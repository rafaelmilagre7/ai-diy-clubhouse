
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#0ABAB5] text-white hover:bg-[#0ABAB5]/80",
        secondary:
          "border-transparent bg-neutral-700 text-neutral-100 hover:bg-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600",
        destructive:
          "border-transparent bg-red-500 text-red-50 hover:bg-red-500/80",
        outline: "text-neutral-100 border-neutral-600 hover:bg-neutral-700 dark:text-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700",
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-500/80",
        warning:
          "border-transparent bg-orange-500 text-white hover:bg-orange-500/80",
        info:
          "border-transparent bg-blue-500 text-white hover:bg-blue-500/80",
        neutral:
          "border-transparent bg-neutral-600 text-white hover:bg-neutral-500 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-500",
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
