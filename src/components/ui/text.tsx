
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textVariants = cva(
  "",
  {
    variants: {
      variant: {
        // Display headings
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
        
        // UI elements
        "label": "ui-label",
        "caption": "ui-caption",
        "button": "ui-button",
        "link": "ui-link",
        
        // Code
        "code": "code-inline",
        
        // Special effects
        "gradient": "text-gradient",
        "glow": "text-glow",
      },
      textColor: {
        default: "text-foreground",
        primary: "text-primary",
        secondary: "text-text-secondary",
        tertiary: "text-text-tertiary",
        muted: "text-text-muted",
        success: "text-success",
        warning: "text-warning",
        error: "text-error",
        info: "text-info",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
        justify: "text-justify",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
    },
    defaultVariants: {
      variant: "body",
      textColor: "default",
      align: "left",
      weight: "normal",
    },
  }
)

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof textVariants> {
  as?: keyof JSX.IntrinsicElements
  truncate?: boolean
  responsive?: boolean
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, variant, textColor, align, weight, as, truncate, responsive, children, ...props }, ref) => {
    const Component = as || 
      (variant?.includes('heading') || variant === 'display' || variant === 'page' || variant === 'section' || variant === 'subsection' || variant === 'card' || variant === 'small' ? 'h2' : 'p')

    return React.createElement(
      Component,
      {
        className: cn(
          textVariants({ variant, textColor, align, weight }),
          truncate && "truncate",
          responsive && "text-responsive-base",
          className
        ),
        ref,
        ...props,
      },
      children
    )
  }
)
Text.displayName = "Text"

export { Text, textVariants }
