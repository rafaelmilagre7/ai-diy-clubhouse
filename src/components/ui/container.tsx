
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const containerVariants = cva(
  "w-full mx-auto",
  {
    variants: {
      size: {
        sm: "max-w-2xl px-4 sm:px-6",
        default: "max-w-7xl px-4 sm:px-6 lg:px-8",
        lg: "max-w-screen-xl px-4 sm:px-6 lg:px-8",
        xl: "max-w-screen-2xl px-4 sm:px-6 lg:px-8",
        full: "max-w-none px-4 sm:px-6 lg:px-8",
        narrow: "max-w-4xl px-4 sm:px-6 lg:px-8",
      },
      spacing: {
        none: "",
        sm: "py-4",
        default: "py-6",
        lg: "py-8",
        xl: "py-12",
      },
    },
    defaultVariants: {
      size: "default",
      spacing: "default",
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
