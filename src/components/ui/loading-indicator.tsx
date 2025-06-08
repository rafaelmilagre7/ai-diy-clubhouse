
import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Circle } from "lucide-react";

interface LoadingIndicatorProps {
  variant?: "spinner" | "dots" | "pulse" | "bars";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: "primary" | "secondary" | "accent" | "muted";
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  variant = "spinner",
  size = "md",
  className,
  color = "primary"
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const colorClasses = {
    primary: "text-primary",
    secondary: "text-text-secondary",
    accent: "text-accent",
    muted: "text-text-muted"
  };

  if (variant === "spinner") {
    return (
      <Loader2 
        className={cn(
          "animate-spin",
          sizeClasses[size],
          colorClasses[color],
          className
        )} 
      />
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <Circle
            key={i}
            className={cn(
              "animate-pulse fill-current",
              sizeClasses[size === "xl" ? "md" : size === "lg" ? "sm" : "sm"],
              colorClasses[color]
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1s"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div 
        className={cn(
          "animate-pulse rounded-full bg-current opacity-60",
          sizeClasses[size],
          colorClasses[color],
          className
        )}
      />
    );
  }

  // bars variant
  return (
    <div className={cn("flex items-end space-x-1", className)}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse bg-current rounded-sm",
            colorClasses[color],
            size === "sm" ? "w-1" : size === "md" ? "w-1.5" : size === "lg" ? "w-2" : "w-3"
          )}
          style={{
            height: `${[0.5, 0.8, 0.6, 0.9][i] * (size === "sm" ? 16 : size === "md" ? 24 : size === "lg" ? 32 : 48)}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: "1.2s"
          }}
        />
      ))}
    </div>
  );
};

export { LoadingIndicator };
