
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const containerVariants = cva(
  "mx-auto w-full",
  {
    variants: {
      size: {
        sm: "max-w-2xl",
        md: "max-w-4xl", 
        lg: "max-w-6xl",
        xl: "max-w-7xl",
        "6xl": "max-w-none",
        full: "max-w-full",
        content: "max-w-3xl",
      },
      padding: {
        none: "",
        sm: "px-4",
        md: "px-6",
        lg: "px-8",
        xl: "px-12",
      },
    },
    defaultVariants: {
      size: "lg",
      padding: "md",
    },
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, ...props }, ref) => {
    return (
      <div
        className={cn(containerVariants({ size, padding }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Container.displayName = "Container";

export { Container, containerVariants };
