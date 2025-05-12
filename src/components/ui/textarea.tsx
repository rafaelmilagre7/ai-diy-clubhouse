
import * as React from "react"

import { cn } from "@/lib/utils"
import { formStateClasses } from "@/lib/themeUtils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          formStateClasses.input.default,
          "flex min-h-[80px] w-full rounded-md px-3 py-2 text-sm placeholder:text-textMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-viverblue focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          props.readOnly && formStateClasses.input.readOnly,
          props.disabled && formStateClasses.input.disabled,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
