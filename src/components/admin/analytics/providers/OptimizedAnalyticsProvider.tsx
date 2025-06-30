
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useOptimizedAnalyticsCache } from '@/hooks/analytics/useOptimizedAnalyticsCache';

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
    console.log('🔧 [ANALYTICS] Otimização:', !isOptimizationEnabled ? 'ATIVADA' : 'DESATIVADA');
  }, [isOptimizationEnabled]);

  const toggleCache = useCallback(() => {
    setCacheEnabled(prev => !prev);
    if (!cacheEnabled) {
      invalidateCache();
    }
    console.log('🗄️ [ANALYTICS] Cache:', !cacheEnabled ? 'ATIVADO' : 'DESATIVADO');
  }, [cacheEnabled, invalidateCache]);

  const invalidateAllCache = useCallback(() => {
    invalidateCache();
    console.log('🗑️ [ANALYTICS] Cache invalidado globalmente');
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
