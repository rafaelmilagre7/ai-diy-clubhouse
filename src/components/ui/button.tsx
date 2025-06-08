
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
          "btn-primary",
        destructive:
          "btn-error",
        outline:
          "btn-outline",
        secondary:
          "btn-secondary",
        ghost: 
          "btn-ghost",
        link: 
          "text-primary underline-offset-4 hover:underline hover:text-primary-hover transition-colors duration-200",
        success:
          "btn-success",
        warning:
          "btn-warning",
        info:
          "btn-info",
        accent:
          "bg-accent text-accent-foreground shadow-sm hover:shadow-md hover:scale-105 hover:brightness-110 active:scale-95 focus-visible:ring-accent/20",
      },
      size: {
        default: "h-10 px-6 py-2",
        xs: "btn-xs",
        sm: "btn-sm", 
        lg: "btn-lg",
        xl: "btn-xl",
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
