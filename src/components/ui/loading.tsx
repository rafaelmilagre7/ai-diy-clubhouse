
import * as React from "react"
import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const loadingVariants = cva(
  "animate-spin text-primary",
  {
    variants: {
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        default: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  text?: string
  centered?: boolean
  fullScreen?: boolean
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size, text, centered = false, fullScreen = false, ...props }, ref) => {
    const containerClasses = cn(
      "flex items-center",
      centered && "justify-center",
      fullScreen && "min-h-screen justify-center",
      text ? "gap-2" : "",
      className
    )

    return (
      <div ref={ref} className={containerClasses} {...props}>
        <Loader2 className={cn(loadingVariants({ size }))} />
        {text && (
          <span className="text-sm text-text-secondary">{text}</span>
        )}
      </div>
    )
  }
)
Loading.displayName = "Loading"

export { Loading, loadingVariants }
