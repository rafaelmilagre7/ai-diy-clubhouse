
import React from "react";
import { LoadingSpinner as BaseLoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "default" | "lg" | "xl" | "2xl";
  className?: string;
  text?: string;
  variant?: "default" | "secondary" | "accent" | "success" | "warning" | "error";
  centered?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "default", 
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
