
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-text-tertiary transition-all duration-200 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 hover:border-border-strong",
          error && "border-error focus-visible:border-error focus-visible:ring-error/20",
          success && "border-success focus-visible:border-success focus-visible:ring-success/20",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
