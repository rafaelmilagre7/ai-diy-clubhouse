
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-sm hover:shadow-md hover-scale",
        secondary: "bg-surface-elevated text-text-primary border border-border hover:bg-surface-hover hover:border-border-strong shadow-sm", 
        outline: "border border-border bg-transparent text-text-primary hover:bg-surface-hover hover:border-border-strong hover-scale",
        ghost: "bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-md hover-scale",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-md hover-scale",
        destructive: "bg-error text-error-foreground hover:bg-error/90 shadow-sm hover:shadow-md hover-scale",
        info: "bg-info text-info-foreground hover:bg-info/90 shadow-sm hover:shadow-md hover-scale",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal bg-transparent",
        gradient: "bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-md hover:shadow-lg hover-scale",
      },
      size: {
        xs: "h-7 px-2 py-1 text-xs rounded-md",
        sm: "h-8 px-3 py-1.5 text-sm rounded-lg",
        default: "h-10 px-4 py-2 text-sm rounded-lg",
        lg: "h-12 px-6 py-3 text-base rounded-xl",
        xl: "h-14 px-8 py-4 text-lg rounded-xl",
        icon: "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
