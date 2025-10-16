import * as React from "react";
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";

interface AuroraButtonProps extends ButtonProps {
  glow?: boolean;
}

/**
 * Botão padrão Aurora com a cor principal da marca (#0ABAB5)
 * Usado para ações primárias em toda a plataforma
 */
export const AuroraButton = React.forwardRef<HTMLButtonElement, AuroraButtonProps>(
  ({ className, glow = false, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="aurora-primary"
        className={cn(
          glow && "hover:shadow-aurora-primary/50",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

AuroraButton.displayName = "AuroraButton";
