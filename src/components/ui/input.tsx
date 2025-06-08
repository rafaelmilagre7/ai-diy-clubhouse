
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border focus-visible:ring-primary/20 hover:border-border-strong",
        success: "border-success focus-visible:ring-success/20 hover:border-success/70",
        warning: "border-warning focus-visible:ring-warning/20 hover:border-warning/70",
        error: "border-error focus-visible:ring-error/20 hover:border-error/70",
        ghost: "border-transparent bg-transparent hover:bg-surface-hover focus-visible:bg-surface",
      },
      inputSize: {
        sm: "h-8 px-2 text-xs",
        default: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: boolean
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, error, success, ...props }, ref) => {
    // Determinar a variante baseada nos props
    let finalVariant = variant
    if (error) finalVariant = "error"
    if (success) finalVariant = "success"

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant: finalVariant, inputSize }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
