
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const containerVariants = cva(
  "w-full",
  {
    variants: {
      size: {
        sm: "max-w-sm mx-auto",
        md: "max-w-md mx-auto",
        lg: "max-w-lg mx-auto",
        xl: "max-w-xl mx-auto",
        "2xl": "max-w-2xl mx-auto",
        "4xl": "max-w-4xl mx-auto",
        "6xl": "max-w-6xl mx-auto",
        full: "max-w-full",
        screen: "w-screen",
      },
      spacing: {
        none: "",
        sm: "px-4",
        md: "px-6",
        lg: "px-8",
        xl: "px-12",
      },
    },
    defaultVariants: {
      size: "6xl",
      spacing: "md",
    },
  }
)

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, spacing, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(containerVariants({ size, spacing }), className)}
        {...props}
      />
    )
  }
)
Container.displayName = "Container"

export { Container, containerVariants }
