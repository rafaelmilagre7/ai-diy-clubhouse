
import React, { Suspense, memo } from "react";
import { LoadingState } from "./LoadingState";

// Import dinâmico da versão otimizada
const OptimizedLoadingScreen = React.lazy(() => import("./OptimizedLoadingScreen"));

interface LoadingScreenProps {
  message?: string;
  useOptimized?: boolean;
  variant?: "spinner" | "skeleton" | "dots";
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  progressValue?: number;
}

const LoadingScreen = memo<LoadingScreenProps>(({ 
  message = "Carregando",
  useOptimized = true,
  variant = "spinner",
  size = "lg",
  showProgress = false,
  progressValue = 0
}) => {
  // Fallback para versão simples se a otimizada falhar
  const SimpleFallback = () => (
    <div className="min-h-screen bg-background">
      <LoadingState
        variant={variant}
        size={size}
        message={`${message} - Estamos preparando sua experiência personalizada do VIVER DE IA Club...`}
        fullScreen
      />
    </div>
  );

  // Se não quiser usar a versão otimizada, usar a simples
  if (!useOptimized) {
    return <SimpleFallback />;
  }

  // Usar versão otimizada com fallback
  return (
    <Suspense fallback={<SimpleFallback />}>
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
