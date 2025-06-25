
import React, { memo } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";

interface OptimizedSolutionsGridLoaderProps {
  title?: string;
  count?: number;
  variant?: "grid" | "list";
  className?: string;
  showTitle?: boolean;
}

// Componente memoizado usando LoadingScreen consolidado
const OptimizedSolutionsGridLoader = memo<OptimizedSolutionsGridLoaderProps>(({ 
  title = "Carregando soluções",
  count = 6,
  variant = "grid",
  className,
  showTitle = true
}) => {
  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <div className="h-1 w-20 bg-viverblue rounded-full" />
        </div>
      )}
      
      <LoadingScreen
        message={title}
        variant="skeleton"
        fullScreen={false}
        className={className}
      />
    </div>
  );
});

OptimizedSolutionsGridLoader.displayName = 'OptimizedSolutionsGridLoader';

export default OptimizedSolutionsGridLoader;
