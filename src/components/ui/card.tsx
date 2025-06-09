import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-xl border transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-surface-elevated border-border",
        elevated: "bg-surface-elevated border-border shadow-lg hover:shadow-xl",
        interactive: "bg-surface-elevated border-border hover:border-border-strong hover:shadow-glow-primary cursor-pointer transform hover:-translate-y-1",
        ghost: "bg-transparent border-transparent",
        outline: "bg-transparent border-border hover:bg-surface-subtle",
        gradient: "bg-gradient-to-br from-surface-elevated to-surface border-border-subtle shadow-md",
        modern: "bg-surface-elevated border-border-subtle shadow-lg hover:shadow-xl backdrop-blur-sm"
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-lg",
        default: "rounded-xl",
        lg: "rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default", 
      rounded: "default",
    },
  }
)

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, padding, rounded, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, padding, rounded }), className)}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'modern';
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5",
      variant === 'modern' && "p-6 border-b border-border-subtle bg-gradient-to-r from-surface-subtle/50 to-transparent",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    variant?: 'default' | 'modern';
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight text-text-primary",
      variant === 'modern' && "text-lg font-bold flex items-center gap-2",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    variant?: 'default' | 'modern';
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-text-secondary",
      variant === 'modern' && "text-text-tertiary font-medium",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-6", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
