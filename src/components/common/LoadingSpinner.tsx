
import React from "react";
import { LoadingSpinner as BaseLoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  variant?: "default" | "accent" | "primary";
  centered?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  className,
  text,
  variant = "default",
  centered = false
}) => {
  return (
    <BaseLoadingSpinner
      size={size}
      variant={variant}
      text={text}
      centered={centered}
      className={cn("transition-all duration-200", className)}
    />
  );
};
