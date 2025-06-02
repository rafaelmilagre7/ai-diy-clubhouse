
import React, { Suspense, memo } from "react";
import { LoadingState } from "./LoadingState";
import { SmartSkeletonLoader } from "./SmartSkeletonLoader";

// Import dinâmico da versão otimizada
const OptimizedLoadingScreen = React.lazy(() => import("./OptimizedLoadingScreen"));

interface LoadingScreenProps {
  message?: string;
  useOptimized?: boolean;
  variant?: "spinner" | "skeleton" | "dots";
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  progressValue?: number;
  skeletonVariant?: "page" | "card" | "list" | "dashboard" | "table";
}

const LoadingScreen = memo<LoadingScreenProps>(({ 
  message = "Carregando",
  useOptimized = true,
  variant = "skeleton",
  size = "lg",
  showProgress = false,
  progressValue = 0,
  skeletonVariant = "page"
}) => {
  // Fallback inteligente com skeleton loader
  const SmartFallback = () => (
    <div className="min-h-screen bg-background p-6">
      {variant === "skeleton" ? (
        <SmartSkeletonLoader variant={skeletonVariant} />
      ) : (
        <LoadingState
          variant={variant}
          size={size}
          message={`${message} - Estamos preparando sua experiência personalizada do VIVER DE IA Club...`}
          fullScreen
        />
      )}
    </div>
  );

  // Se não quiser usar a versão otimizada, usar a simples
  if (!useOptimized) {
    return <SmartFallback />;
  }

  // Usar versão otimizada com fallback
  return (
    <Suspense fallback={<SmartFallback />}>
      <OptimizedLoadingScreen
        message={message}
        variant={variant}
        size={size}
        showProgress={showProgress}
        progressValue={progressValue}
        fullScreen={true}
      />
    </Suspense>
  );
});

LoadingScreen.displayName = 'LoadingScreen';

export default LoadingScreen;
