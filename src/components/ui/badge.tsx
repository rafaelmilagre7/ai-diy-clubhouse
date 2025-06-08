
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-surface text-text-primary hover:bg-surface-hover",
        primary: "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20",
        secondary: "border-border bg-surface-elevated text-text-secondary hover:bg-surface-hover hover:border-border-strong",
        success: "border-success/20 bg-success/10 text-success hover:bg-success/20",
        warning: "border-warning/20 bg-warning/10 text-warning hover:bg-warning/20",
        error: "border-error/20 bg-error/10 text-error hover:bg-error/20",
        destructive: "border-error/20 bg-error/10 text-error hover:bg-error/20",
        info: "border-info/20 bg-info/10 text-info hover:bg-info/20",
        accent: "border-accent/20 bg-accent/10 text-accent hover:bg-accent/20",
        outline: "border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary",
        ghost: "border-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
        gradient: "border-transparent bg-gradient-primary text-primary-foreground hover:opacity-90",
        neutral: "border-border/50 bg-surface-elevated text-text-secondary hover:bg-surface-hover",
      },
      size: {
        xs: "px-1.5 py-0.5 text-xs h-5",
        sm: "px-2 py-0.5 text-xs h-6",
        default: "px-2.5 py-0.5 text-sm h-7",
        lg: "px-3 py-1 text-sm h-8",
        xl: "px-4 py-1.5 text-base h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
