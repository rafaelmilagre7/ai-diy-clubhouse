
import React, { memo, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SmartSkeletonProps {
  type: "card" | "list" | "table" | "form" | "dashboard" | "custom";
  count?: number;
  className?: string;
  animated?: boolean;
  variant?: "default" | "pulse" | "wave";
}

// Componente memoizado para diferentes tipos de skeleton
const SmartSkeleton = memo<SmartSkeletonProps>(({ 
  type, 
  count = 1, 
  className,
  animated = true,
  variant = "default"
}) => {
  // Memoizar animação CSS baseada na variante
  const animationClass = useMemo(() => {
    if (!animated) return "";
    
    switch (variant) {
      case "pulse":
        return "animate-pulse";
      case "wave":
        return "animate-pulse duration-1000";
      default:
        return "animate-pulse";
    }
  }, [animated, variant]);

  // Memoizar template baseado no tipo
  const skeletonTemplate = useMemo(() => {
    switch (type) {
      case "card":
        return (
          <div className={cn("border rounded-lg p-4 space-y-3", className, animationClass)}>
            <Skeleton className="h-skeleton-h-lg w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-3 w-skeleton-sm" />
              <Skeleton className="h-3 w-timestamp" />
            </div>
          </div>
        );

      case "list":
        return (
          <div className={cn("space-y-3", className, animationClass)}>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </div>
        );

      case "table":
        return (
          <div className={cn("space-y-2", className, animationClass)}>
            <div className="grid grid-cols-4 gap-4 p-4 border-b">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        );

      case "form":
        return (
          <div className={cn("space-y-4", className, animationClass)}>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        );

      case "dashboard":
        return (
          <div className={cn("space-y-6", className, animationClass)}>
            {/* Header */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-1/3" />
                </div>
              ))}
            </div>
            
            {/* Content area */}
            <Skeleton className="h-chart-md w-full" />
          </div>
        );

      default:
        return <Skeleton className={cn("h-20 w-full", className, animationClass)} />;
    }
  }, [type, className, animationClass]);

  // Renderizar múltiplas instâncias se count > 1
  if (count > 1) {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }, (_, index) => (
          <div key={index}>
            {skeletonTemplate}
          </div>
        ))}
      </div>
    );
  }

  return skeletonTemplate;
});

SmartSkeleton.displayName = 'SmartSkeleton';

export default SmartSkeleton;
