
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-background hover:bg-primary-hover active:bg-primary-active shadow-sm hover:shadow-md",
        secondary: "bg-surface-elevated text-text-primary border border-border hover:bg-surface-hover hover:border-border-strong", 
        outline: "border border-border bg-transparent text-text-primary hover:bg-surface-hover hover:border-border-strong",
        ghost: "bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
        success: "bg-success text-background hover:bg-success-dark shadow-sm hover:shadow-md",
        warning: "bg-warning text-background hover:bg-warning-dark shadow-sm hover:shadow-md",
        destructive: "bg-error text-background hover:bg-error-dark shadow-sm hover:shadow-md",
        info: "bg-info text-background hover:bg-info-dark shadow-sm hover:shadow-md",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal bg-transparent",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        xs: "h-7 px-2 py-1 text-xs", 
        sm: "h-8 px-3 py-1.5 text-sm",
        lg: "h-12 px-6 py-3 text-base",
        xl: "h-14 px-8 py-4 text-lg",
        icon: "h-10 w-10",
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
