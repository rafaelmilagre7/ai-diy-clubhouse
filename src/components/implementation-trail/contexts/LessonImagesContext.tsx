import React, { createContext, useContext, useState, useCallback } from 'react';

interface LessonImagesContextType {
  preloadLessonImages: (lessonIds: string[]) => Promise<void>;
  loading: boolean;
}

const LessonImagesContext = createContext<LessonImagesContextType | undefined>(undefined);

export const useLessonImages = () => {
  const context = useContext(LessonImagesContext);
  if (!context) {
    throw new Error('useLessonImages must be used within a LessonImagesProvider');
  }
  return context;
};

interface LessonImagesProviderProps {
  children: React.ReactNode;
}

export const LessonImagesProvider = ({ children }: LessonImagesProviderProps) => {
  const [loading, setLoading] = useState(false);

  const preloadLessonImages = useCallback(async (lessonIds: string[]) => {
    if (!lessonIds.length) return;
    
    setLoading(true);
    
    try {
      // Simular preload de imagens das aulas
      console.log('[LessonImages] Precarregando imagens para:', lessonIds);
      
      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('[LessonImages] Imagens precarregadas com sucesso');
    } catch (error) {
      console.error('[LessonImages] Erro ao precarregar imagens:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    preloadLessonImages,
    loading,
  };

  return (
    <LessonImagesContext.Provider value={value}>
      {children}
    </LessonImagesContext.Provider>
  );
};