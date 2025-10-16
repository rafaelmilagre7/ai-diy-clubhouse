
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  variant?: "spinner" | "skeleton" | "dots";
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = "spinner",
  size = "md",
  message,
  className,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const containerClasses = cn(
    "flex flex-col items-center justify-center",
    fullScreen ? "min-h-screen" : "py-8",
    className
  );

  if (variant === "skeleton") {
    return (
      <div className={containerClasses}>
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={containerClasses}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-aurora-primary rounded-full animate-pulse",
                size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4"
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s"
              }}
            />
          ))}
        </div>
        {message && (
          <p className="mt-4 text-sm text-muted-foreground text-center">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <Loader2 className={cn("text-aurora-primary animate-spin", sizeClasses[size])} />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground text-center">{message}</p>
      )}
    </div>
  );
};
