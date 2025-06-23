
import * as React from "react"
import { cn } from "@/lib/utils"

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, type, error, label, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-white">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-md border px-4 py-3 text-sm transition-colors duration-200",
            "bg-[#1A1E2E] border-neutral-600 text-white placeholder:text-neutral-400",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-viverblue focus-visible:border-viverblue",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-400 font-medium">{error}</p>
        )}
      </div>
    )
  }
)
EnhancedInput.displayName = "EnhancedInput"

export { EnhancedInput }
