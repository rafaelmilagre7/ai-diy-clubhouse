
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw, Zap, Activity } from "lucide-react";

const loadingSpinnerVariants = cva(
  "animate-spin",
  {
    variants: {
      variant: {
        default: "text-primary",
        secondary: "text-text-secondary", 
        accent: "text-accent",
        success: "text-success",
        warning: "text-warning",
        error: "text-error"
      },
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4", 
        default: "h-5 w-5",
        lg: "h-6 w-6",
        xl: "h-8 w-8",
        "2xl": "h-12 w-12"
      },
      speed: {
        slow: "animate-[spin_3s_linear_infinite]",
        default: "animate-spin",
        fast: "animate-[spin_0.5s_linear_infinite]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default", 
      speed: "default"
    },
  }
)

const LoadingSpinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & 
  VariantProps<typeof loadingSpinnerVariants> & {
    icon?: 'loader' | 'refresh' | 'zap' | 'activity';
    text?: string;
    centered?: boolean;
  }
>(({ 
  className, 
  variant, 
  size, 
  speed,
  icon = 'loader',
  text,
  centered = false,
  ...props 
}, ref) => {
  const iconComponents = {
    loader: Loader2,
    refresh: RefreshCw, 
    zap: Zap,
    activity: Activity
  }
  
  const IconComponent = iconComponents[icon]

  const spinner = (
    <div 
      ref={ref}
      className={cn(
        "flex items-center gap-3",
        centered && "justify-center",
        className
      )}
      {...props}
    >
      <IconComponent className={cn(loadingSpinnerVariants({ variant, size, speed }))} />
      {text && (
        <span className={cn(
          "font-medium animate-pulse",
          variant === 'default' && "text-primary",
          variant === 'secondary' && "text-text-secondary",
          variant === 'accent' && "text-accent",
          variant === 'success' && "text-success",
          variant === 'warning' && "text-warning",
          variant === 'error' && "text-error"
        )}>
          {text}
        </span>
      )}
    </div>
  )

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px]">
        {spinner}
      </div>
    )
  }

  return spinner
})

LoadingSpinner.displayName = "LoadingSpinner"

export { LoadingSpinner, loadingSpinnerVariants }
