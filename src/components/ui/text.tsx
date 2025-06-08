
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textVariants = cva(
  "",
  {
    variants: {
      variant: {
        // Headings
        "display": "heading-display",
        "page": "heading-page", 
        "section": "heading-section",
        "subsection": "heading-subsection",
        "card": "heading-card",
        "small": "heading-small",
        
        // Body text
        "body-large": "body-large",
        "body": "body-default",
        "body-small": "body-small", 
        "body-tiny": "body-tiny",
        
        // UI text
        "label": "ui-label",
        "caption": "ui-caption",
        "button": "ui-button",
        "link": "ui-link",
        
        // Code
        "code": "code-inline",
        
        // Effects
        "gradient": "text-gradient",
        "glow": "text-glow",
      },
      textColor: {
        primary: "text-foreground",
        secondary: "text-text-secondary",
        tertiary: "text-text-tertiary", 
        disabled: "text-text-disabled",
        accent: "text-primary",
        success: "text-success",
        warning: "text-warning", 
        error: "text-error",
        info: "text-info",
      },
    },
    defaultVariants: {
      variant: "body",
      textColor: "primary",
    },
  }
)

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof textVariants> {
  as?: React.ElementType
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, variant, textColor, as: Component = "p", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(textVariants({ variant, textColor }), className)}
        {...props}
      />
    )
  }
)
Text.displayName = "Text"

export { Text, textVariants }
