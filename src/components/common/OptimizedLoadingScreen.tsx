
import React, { Suspense, memo } from "react";
import LoadingScreen from "./LoadingScreen";
import { cn } from "@/lib/utils";

interface OptimizedLoadingScreenProps {
  message?: string;
  variant?: "spinner" | "skeleton" | "dots";
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
  showProgress?: boolean;
  progressValue?: number;
}

// Componente memoizado que usa LoadingScreen consolidado
const OptimizedLoadingScreen = memo<OptimizedLoadingScreenProps>(({ 
  message = "Carregando",
  variant = "spinner",
  size = "lg",
  fullScreen = true,
  className,
  showProgress = false,
  progressValue = 0
}) => {
  return (
    <div className={cn(fullScreen ? "min-h-screen" : "min-h-[400px]", className)}>
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-viverblue border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <LoadingScreen
          variant={variant}
          size={size}
          message={message}
          fullScreen={fullScreen}
          showProgress={showProgress}
          progressValue={progressValue}
          optimized={true}
        />
      </Suspense>
    </div>
  );
});

OptimizedLoadingScreen.displayName = 'OptimizedLoadingScreen';

export default OptimizedLoadingScreen;
