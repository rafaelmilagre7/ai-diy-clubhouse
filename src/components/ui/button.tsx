
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow-md hover:scale-105 active:scale-95",
        destructive:
          "bg-error text-error-foreground shadow-sm hover:shadow-md hover:scale-105 hover:brightness-110 active:scale-95",
        outline:
          "border-2 border-border bg-transparent text-foreground shadow-sm hover:bg-surface-hover hover:border-border-strong hover:scale-105 active:scale-95",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-hover hover:shadow-md hover:scale-105 active:scale-95",
        ghost: 
          "text-foreground hover:bg-surface-hover hover:scale-105 active:scale-95",
        link: 
          "text-primary underline-offset-4 hover:underline hover:text-primary-hover",
        success:
          "bg-success text-success-foreground shadow-sm hover:shadow-md hover:scale-105 hover:brightness-110 active:scale-95",
        warning:
          "bg-warning text-warning-foreground shadow-sm hover:shadow-md hover:scale-105 hover:brightness-110 active:scale-95",
        info:
          "bg-info text-info-foreground shadow-sm hover:shadow-md hover:scale-105 hover:brightness-110 active:scale-95",
        accent:
          "bg-accent text-accent-foreground shadow-sm hover:shadow-md hover:scale-105 hover:brightness-110 active:scale-95",
      },
      size: {
        default: "h-10 px-6 py-2",
        xs: "h-7 px-3 py-1 text-xs",
        sm: "h-8 px-4 py-1.5 text-xs",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
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
