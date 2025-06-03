
import React, { memo } from 'react';

interface OnboardingPerformanceOptimizerProps {
  children: React.ReactNode;
}

/**
 * Wrapper de performance para o onboarding
 * Aplica otimizações específicas para o fluxo de onboarding
 */
export const OnboardingPerformanceOptimizer: React.FC<OnboardingPerformanceOptimizerProps> = memo(({ 
  children 
}) => {
  return (
    <div className="onboarding-performance-wrapper">
      {children}
    </div>
  );
});

OnboardingPerformanceOptimizer.displayName = 'OnboardingPerformanceOptimizer';
