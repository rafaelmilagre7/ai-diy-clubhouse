
import React, { memo, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';

interface OnboardingPerformanceOptimizerProps {
  children: React.ReactNode;
  onFieldChange?: (field: string, value: string) => void;
  debounceMs?: number;
}

export const OnboardingPerformanceOptimizer: React.FC<OnboardingPerformanceOptimizerProps> = memo(({
  children,
  onFieldChange,
  debounceMs = 300
}) => {
  // Debounced field change handler
  const debouncedFieldChange = useMemo(
    () => onFieldChange ? debounce(onFieldChange, debounceMs) : undefined,
    [onFieldChange, debounceMs]
  );

  // Memoized event handler
  const handleFieldChange = useCallback((field: string, value: string) => {
    debouncedFieldChange?.(field, value);
  }, [debouncedFieldChange]);

  // Cleanup debounced function on unmount
  React.useEffect(() => {
    return () => {
      debouncedFieldChange?.cancel();
    };
  }, [debouncedFieldChange]);

  return (
    <div className="onboarding-performance-wrapper">
      {children}
    </div>
  );
});

OnboardingPerformanceOptimizer.displayName = 'OnboardingPerformanceOptimizer';
