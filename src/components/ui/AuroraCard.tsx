import * as React from "react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

interface AuroraCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'glass';
  glow?: boolean;
}

/**
 * Card padronizado com variantes do Aurora Design System
 * - default: Card padrão com bordas sutis
 * - elevated: Com shadow elevado
 * - interactive: Com efeitos de hover
 * - glass: Com efeito glassmorphism
 */
export const AuroraCard = React.forwardRef<HTMLDivElement, AuroraCardProps>(
  ({ className, variant = 'default', glow = false, ...props }, ref) => {
    const variantStyles = {
      default: "bg-card border-border",
      elevated: "bg-card border-border shadow-lg",
      interactive: "bg-card border-border hover:shadow-lg hover:border-aurora-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer",
      glass: "bg-card/80 backdrop-blur-sm border-border/50"
    };

    return (
      <Card
        ref={ref}
        className={cn(
          variantStyles[variant],
          glow && "hover:shadow-aurora-primary/10",
          className
        )}
        {...props}
      />
    );
  }
);

AuroraCard.displayName = "AuroraCard";
