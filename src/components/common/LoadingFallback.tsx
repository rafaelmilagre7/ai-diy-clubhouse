
import React from 'react';
import LoadingScreen from './LoadingScreen';
import { useLoadingState } from '@/hooks/useLoadingState';

interface LoadingFallbackProps {
  message?: string;
  showForceButton?: boolean;
  onForceComplete?: () => void;
  variant?: 'full' | 'partial' | 'inline';
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = "Carregando...",
  showForceButton = true,
  onForceComplete,
  variant = 'full'
}) => {
  const [{ duration, isSlowLoading, isVerySlowLoading }] = useLoadingState();

  const fullScreen = variant === 'full';
  const loadingVariant = variant === 'inline' ? 'spinner' : 'spinner';

  return (
    <LoadingScreen
      message={message}
      variant={loadingVariant}
      fullScreen={fullScreen}
      showForceButton={showForceButton}
      onForceComplete={onForceComplete}
      duration={duration}
      isSlowLoading={isSlowLoading}
      isVerySlowLoading={isVerySlowLoading}
    />
  );
};
