
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textVariants = cva(
  "transition-colors duration-200",
  {
    variants: {
      variant: {
        // Hierarquia de cabeçalhos
        "page": "text-4xl font-bold tracking-tight",
        "section": "text-3xl font-bold tracking-tight",
        "subsection": "text-2xl font-semibold tracking-tight",
        "heading": "text-xl font-semibold",
        "subheading": "text-lg font-medium",
        
        // Texto de corpo
        "body-large": "text-base font-normal leading-relaxed",
        "body": "text-sm font-normal leading-normal",
        "body-small": "text-xs font-normal leading-normal",
        
        // Texto especializado
        "caption": "text-xs font-medium uppercase tracking-wide",
        "code": "text-sm font-mono bg-surface-elevated px-1.5 py-0.5 rounded-md",
        "link": "text-sm font-medium underline-offset-4 hover:underline cursor-pointer",
        "button": "text-sm font-medium",
        "label": "text-sm font-medium leading-none",
        "muted": "text-xs text-text-muted",
        
        // Adicionar variantes que estavam faltando
        "card": "text-lg font-semibold leading-tight",
        "display-small": "text-3xl font-bold tracking-tight",
      },
      textColor: {
        primary: "text-text-primary",
        secondary: "text-text-secondary", 
        tertiary: "text-text-tertiary",
        muted: "text-text-muted",
        accent: "text-primary",
        success: "text-success",
        warning: "text-warning",
        error: "text-error",
        info: "text-info",
      },
      weight: {
        light: "font-light",
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
        justify: "text-justify",
      },
      truncate: {
        true: "truncate",
        false: "",
      },
    },
    defaultVariants: {
      variant: "body",
      textColor: "primary",
      weight: "normal",
      align: "left",
      truncate: false,
    },
  }
)

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "small" | "strong" | "em"
  gradient?: boolean
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, variant, textColor, weight, align, truncate, as, gradient, ...props }, ref) => {
    const Component = as || "p"
    
    return (
      <Component
        className={cn(
          textVariants({ variant, textColor, weight, align, truncate }),
          gradient && "bg-gradient-text bg-clip-text text-transparent",
          className
        )}
        ref={ref as any}
        {...props}
      />
    )
  }
)
Text.displayName = "Text"

export { Text, textVariants }
