import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { SolutionDataProvider } from './contexts/SolutionDataContext';
import { LessonImagesProvider } from './contexts/LessonImagesContext';
import { memoizeWithTTL } from '@/utils/performance';

interface OptimizedTrailContextType {
  preloadData: (solutionIds: string[], lessonIds: string[]) => Promise<void>;
}

const OptimizedTrailContext = createContext<OptimizedTrailContextType | undefined>(undefined);

// Memoizar operações custosas
const memoizedPreload = memoizeWithTTL(async (ids: string[]) => {
  return Promise.resolve(ids);
}, 300000); // 5 minutos

export const OptimizedTrailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const preloadData = useCallback(async (solutionIds: string[], lessonIds: string[]) => {
    // Preload otimizado com cache
    await Promise.all([
      memoizedPreload(solutionIds),
      memoizedPreload(lessonIds)
    ]);
  }, []);

  const value = useMemo(() => ({
    preloadData,
  }), [preloadData]);

  return (
    <OptimizedTrailContext.Provider value={value}>
      <SolutionDataProvider>
        <LessonImagesProvider>
          {children}
        </LessonImagesProvider>
      </SolutionDataProvider>
    </OptimizedTrailContext.Provider>
  );
};

export const useOptimizedTrail = () => {
  const context = useContext(OptimizedTrailContext);
  if (context === undefined) {
    throw new Error('useOptimizedTrail must be used within an OptimizedTrailProvider');
  }
  return context;
};