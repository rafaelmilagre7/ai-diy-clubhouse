
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textVariants = cva(
  "leading-relaxed",
  {
    variants: {
      variant: {
        // Headings
        display: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-none",
        page: "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight",
        section: "text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight",
        subsection: "text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight leading-snug",
        card: "text-lg md:text-xl font-semibold leading-snug",
        small: "text-base md:text-lg font-medium leading-snug",
        
        // Body text
        "body-large": "text-lg md:text-xl leading-relaxed",
        body: "text-base leading-relaxed",
        "body-small": "text-sm leading-relaxed",
        "body-tiny": "text-xs leading-normal",
        
        // UI elements
        label: "text-sm font-medium leading-none",
        caption: "text-xs text-text-muted leading-tight",
        button: "text-sm font-medium leading-none",
        link: "text-sm text-primary hover:text-primary-hover underline underline-offset-4 cursor-pointer",
        
        // Code
        "code-inline": "text-sm font-mono bg-surface px-1.5 py-0.5 rounded border",
      },
      textColor: {
        primary: "text-text-primary",
        secondary: "text-text-secondary", 
        tertiary: "text-text-tertiary",
        muted: "text-text-muted",
        inherit: "text-inherit",
        success: "text-success",
        warning: "text-warning",
        error: "text-error",
        info: "text-info",
      },
      weight: {
        thin: "font-thin",
        light: "font-light",
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
        extrabold: "font-extrabold",
        black: "font-black",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
        justify: "text-justify",
      },
    },
    defaultVariants: {
      variant: "body",
      textColor: "primary",
      weight: "normal",
      align: "left",
    },
  }
)

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div" | "label"
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, variant, textColor, weight, align, as, ...props }, ref) => {
    const Comp = as || getDefaultComponent(variant)
    
    return (
      <Comp
        className={cn(textVariants({ variant, textColor, weight, align }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)

function getDefaultComponent(variant?: string): keyof JSX.IntrinsicElements {
  switch (variant) {
    case "display":
    case "page":
      return "h1"
    case "section":
      return "h2"
    case "subsection":
      return "h3"
    case "card":
    case "small":
      return "h4"
    case "label":
      return "label"
    case "caption":
      return "span"
    default:
      return "p"
  }
}

Text.displayName = "Text"

export { Text, textVariants }
