
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "h-10 px-3 py-2 border-border-subtle focus-visible:border-primary",
        modern: "h-12 px-4 py-3 bg-surface-elevated border-border-subtle hover:border-border-hover focus-visible:border-primary focus-visible:bg-surface focus-visible:shadow-glow-primary rounded-xl font-medium",
        floating: "h-14 px-4 pt-6 pb-2 bg-surface-elevated border-border-subtle hover:border-border-hover focus-visible:border-primary rounded-xl",
        minimal: "h-10 px-0 py-2 border-0 border-b border-border-subtle bg-transparent focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none",
        ghost: "h-10 px-3 py-2 border-0 bg-transparent hover:bg-surface-hover focus-visible:bg-surface-elevated focus-visible:ring-1"
      },
      size: {
        sm: "h-8 px-2 text-xs",
        default: "",
        lg: "h-12 px-4 text-base"
      },
      state: {
        default: "",
        error: "border-error focus-visible:border-error focus-visible:ring-error/20",
        success: "border-success focus-visible:border-success focus-visible:ring-success/20",
        warning: "border-warning focus-visible:border-warning focus-visible:ring-warning/20"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default"
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, state, type, leftIcon, rightIcon, isPassword, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    
    const inputType = isPassword ? (showPassword ? "text" : "password") : type

    const inputElement = (
      <input
        type={inputType}
        className={cn(
          inputVariants({ variant, size, state }),
          leftIcon && "pl-10",
          (rightIcon || isPassword) && "pr-10",
          variant === "floating" && isFocused && "pt-7 pb-1",
          className
        )}
        ref={ref}
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
        {...props}
      />
    )

    if (leftIcon || rightIcon || isPassword) {
      return (
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary group-focus-within:text-primary transition-colors">
              {leftIcon}
            </div>
          )}
          
          {inputElement}
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
          
          {rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary group-focus-within:text-primary transition-colors">
              {rightIcon}
            </div>
          )}
        </div>
      )
    }

    return inputElement
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
