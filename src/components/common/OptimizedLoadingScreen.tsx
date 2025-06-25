
import React, { Suspense, memo, useMemo } from "react";
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

// Componente memoizado para evitar re-renders desnecessários
const OptimizedLoadingScreen = memo<OptimizedLoadingScreenProps>(({ 
  message = "Carregando",
  variant = "spinner",
  size = "lg",
  fullScreen = true,
  className,
  showProgress = false,
  progressValue = 0
}) => {
  // Memoizar mensagem personalizada para VIVER DE IA
  const enhancedMessage = useMemo(() => {
    const baseMessage = message === "Carregando" 
      ? "Preparando sua experiência personalizada do VIVER DE IA Club"
      : message;
    
    return `${baseMessage}...`;
  }, [message]);

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
          message={enhancedMessage}
          fullScreen={fullScreen}
        />
        
        {showProgress && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-64">
            <div className="bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="bg-viverblue h-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progressValue))}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {Math.round(progressValue)}% concluído
            </p>
          </div>
        )}
      </Suspense>
    </div>
  );
});

OptimizedLoadingScreen.displayName = 'OptimizedLoadingScreen';

export default OptimizedLoadingScreen;
