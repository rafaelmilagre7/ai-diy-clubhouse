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
      // Preload real das imagens das aulas
      const imagePromises = lessonIds.map(async (lessonId) => {
        const imageUrl = `/api/lessons/${lessonId}/cover`;
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = imageUrl;
        });
      });
      
      await Promise.all(imagePromises);
    } catch (error) {
      // Falha silenciosa no preload
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