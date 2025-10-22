import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { SolutionDataProvider } from './contexts/SolutionDataContext';
import { LessonImagesProvider } from './contexts/LessonImagesContext';

interface OptimizedTrailContextType {
  preloadData: (solutionIds: string[], lessonIds: string[]) => Promise<void>;
}

const OptimizedTrailContext = createContext<OptimizedTrailContextType | undefined>(undefined);

// Placeholder for future preloading implementation
// Currently just validates the structure without actual preloading
const simplePreload = async (ids: string[]) => {
  return Promise.resolve(ids);
};

export const OptimizedTrailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const preloadData = useCallback(async (solutionIds: string[], lessonIds: string[]) => {
    // Structure ready for future preloading implementation
    await Promise.all([
      simplePreload(solutionIds),
      simplePreload(lessonIds)
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