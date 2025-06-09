
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const skeletonVariants = cva(
  "animate-pulse rounded-md",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-surface-elevated/60 to-surface-hover/40 backdrop-blur-sm",
        modern: "bg-gradient-to-r from-surface-elevated via-surface-hover to-surface-elevated bg-[length:200%_100%] animate-[shimmer_2s_infinite]",
        pulse: "bg-surface-elevated animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]",
        wave: "bg-gradient-to-r from-surface-elevated via-primary/10 to-surface-elevated bg-[length:400%_100%] animate-[wave_3s_ease-in-out_infinite]"
      },
      size: {
        xs: "h-3",
        sm: "h-4", 
        default: "h-5",
        lg: "h-6",
        xl: "h-8"
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        default: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default"
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  lines?: number;
  spacing?: "none" | "sm" | "default" | "lg";
}

function Skeleton({
  className,
  variant,
  size,
  rounded,
  lines = 1,
  spacing = "default",
  ...props
}: SkeletonProps) {
  const spacingClasses = {
    none: "space-y-0",
    sm: "space-y-2",
    default: "space-y-3",
    lg: "space-y-4"
  };

  if (lines === 1) {
    return (
      <div
        className={cn(skeletonVariants({ variant, size, rounded }), className)}
        {...props}
      />
    )
  }

  return (
    <div className={cn("flex flex-col", spacingClasses[spacing])}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            skeletonVariants({ variant, size, rounded }),
            index === lines - 1 && lines > 1 && "w-3/4", // Última linha menor
            className
          )}
          {...props}
        />
      ))}
    </div>
  )
}

export { Skeleton, skeletonVariants }
