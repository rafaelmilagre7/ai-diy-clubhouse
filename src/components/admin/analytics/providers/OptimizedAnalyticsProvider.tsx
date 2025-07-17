
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useOptimizedAnalyticsCache } from '@/hooks/analytics/useOptimizedAnalyticsCache';
import conditionalLogger from "@/utils/conditionalLogger";

interface OptimizedAnalyticsContextType {
  isOptimizationEnabled: boolean;
  cacheEnabled: boolean;
  debounceDelay: number;
  toggleOptimization: () => void;
  toggleCache: () => void;
  setDebounceDelay: (delay: number) => void;
  invalidateAllCache: () => void;
  getPerformanceStats: () => any;
}

const OptimizedAnalyticsContext = createContext<OptimizedAnalyticsContextType | undefined>(undefined);

interface OptimizedAnalyticsProviderProps {
  children: ReactNode;
}

export const OptimizedAnalyticsProvider = ({ children }: OptimizedAnalyticsProviderProps) => {
  const [isOptimizationEnabled, setIsOptimizationEnabled] = useState(true);
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [debounceDelay, setDebounceDelay] = useState(300);

  const { invalidateCache, getPerformanceStats } = useOptimizedAnalyticsCache();

  const toggleOptimization = useCallback(() => {
    setIsOptimizationEnabled(prev => !prev);
    conditionalLogger.debug('🔧 [ANALYTICS] Otimização:', { status: !isOptimizationEnabled ? 'ATIVADA' : 'DESATIVADA' });
  }, [isOptimizationEnabled]);

  const toggleCache = useCallback(() => {
    setCacheEnabled(prev => !prev);
    if (!cacheEnabled) {
      invalidateCache();
    }
    conditionalLogger.debug('🗄️ [ANALYTICS] Cache:', { status: !cacheEnabled ? 'ATIVADO' : 'DESATIVADO' });
  }, [cacheEnabled, invalidateCache]);

  const invalidateAllCache = useCallback(() => {
    invalidateCache();
    conditionalLogger.debug('🗑️ [ANALYTICS] Cache invalidado globalmente');
  }, [invalidateCache]);

  const value: OptimizedAnalyticsContextType = {
    isOptimizationEnabled,
    cacheEnabled,
    debounceDelay,
    toggleOptimization,
    toggleCache,
    setDebounceDelay,
    invalidateAllCache,
    getPerformanceStats
  };

  return (
    <OptimizedAnalyticsContext.Provider value={value}>
      {children}
    </OptimizedAnalyticsContext.Provider>
  );
};

export const useOptimizedAnalyticsContext = () => {
  const context = useContext(OptimizedAnalyticsContext);
  if (context === undefined) {
    throw new Error('useOptimizedAnalyticsContext must be used within OptimizedAnalyticsProvider');
  }
  return context;
};
