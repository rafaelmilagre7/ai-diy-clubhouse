
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-text-primary",
        filled: "border-border-subtle bg-surface-elevated text-text-primary",
        outline: "border-border bg-transparent text-text-primary",
        ghost: "border-transparent bg-transparent text-text-primary hover:bg-surface-hover",
      },
      size: {
        default: "h-10 px-3 py-2",
        sm: "h-9 px-3 py-2",
        lg: "h-11 px-4 py-2",
      },
      state: {
        default: "",
        error: "border-error focus-visible:ring-error/20",
        success: "border-success focus-visible:ring-success/20",
        warning: "border-warning focus-visible:ring-warning/20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, state, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, state }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
