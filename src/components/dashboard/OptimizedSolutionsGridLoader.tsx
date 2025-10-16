
import React, { memo, useMemo } from "react";
import SmartSkeleton from "@/components/common/SmartSkeleton";
import { cn } from "@/lib/utils";

interface OptimizedSolutionsGridLoaderProps {
  title?: string;
  count?: number;
  variant?: "grid" | "list";
  className?: string;
  showTitle?: boolean;
}

// Componente memoizado para grid de soluções
const OptimizedSolutionsGridLoader = memo<OptimizedSolutionsGridLoaderProps>(({ 
  title = "Carregando soluções",
  count = 6,
  variant = "grid",
  className,
  showTitle = true
}) => {
  // Memoizar classes do grid
  const gridClasses = useMemo(() => cn(
    variant === "grid" 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      : "space-y-4",
    className
  ), [variant, className]);

  // Memoizar o título para evitar re-renders
  const titleElement = useMemo(() => {
    if (!showTitle) return null;
    
    return (
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <div className="h-1 w-20 bg-aurora-primary rounded-full" />
      </div>
    );
  }, [showTitle, title]);

  return (
    <div className="space-y-4">
      {titleElement}
      
      <div className={gridClasses}>
        {Array.from({ length: count }, (_, index) => (
          <SmartSkeleton
            key={`solution-skeleton-${index}`}
            type="card"
            animated={true}
            variant="pulse"
          />
        ))}
      </div>
    </div>
  );
});

OptimizedSolutionsGridLoader.displayName = 'OptimizedSolutionsGridLoader';

export default OptimizedSolutionsGridLoader;
