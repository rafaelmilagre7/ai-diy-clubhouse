
import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';

interface LessonImageData {
  id: string;
  cover_image_url?: string;
  title: string;
  estimated_time_minutes?: number;
  difficulty_level?: string;
  description?: string;
}

interface LessonImagesContextType {
  lessonImages: Record<string, string>;
  lessonMetadata: Record<string, LessonImageData>;
  loading: boolean;
  getLessonImage: (lessonId: string) => string | null;
  getLessonMetadata: (lessonId: string) => LessonImageData | null;
  preloadLessonImages: (lessonIds: string[]) => Promise<void>;
}

const LessonImagesContext = createContext<LessonImagesContextType | null>(null);

export const LessonImagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lessonImages, setLessonImages] = useState<Record<string, string>>({});
  const [lessonMetadata, setLessonMetadata] = useState<Record<string, LessonImageData>>({});
  const [loading, setLoading] = useState(false);
  const { log, logError } = useLogging();
  
  const loadingLessonsRef = useRef<Set<string>>(new Set());
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchLessonImages = useCallback(async (lessonIds: string[]) => {
    if (lessonIds.length === 0) return;

    const missingIds = lessonIds.filter(id => 
      !lessonMetadata[id] && !loadingLessonsRef.current.has(id)
    );

    if (missingIds.length === 0) return;

    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        
        missingIds.forEach(id => loadingLessonsRef.current.add(id));
        
        log('Buscando imagens e metadados das aulas', { lessonIds: missingIds });

        const { data, error } = await supabase
          .from('learning_lessons')
          .select('id, cover_image_url, title, estimated_time_minutes, difficulty_level, description')
          .in('id', missingIds as any);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          const imagesMap = (data as any).reduce((acc: Record<string, string>, lesson: LessonImageData) => {
            if (lesson.cover_image_url) {
              acc[lesson.id] = lesson.cover_image_url;
            }
            return acc;
          }, {} as Record<string, string>);

          const metadataMap = (data as any).reduce((acc: Record<string, LessonImageData>, lesson: LessonImageData) => {
            acc[lesson.id] = lesson;
            return acc;
          }, {} as Record<string, LessonImageData>);

          setLessonImages(prev => ({ ...prev, ...imagesMap }));
          setLessonMetadata(prev => ({ ...prev, ...metadataMap }));
          
          log('Imagens e metadados das aulas carregados', { 
            count: Object.keys(imagesMap).length,
            images: Object.keys(imagesMap)
          });
        }

      } catch (error) {
        logError('Erro ao buscar imagens das aulas', error);
      } finally {
        missingIds.forEach(id => loadingLessonsRef.current.delete(id));
        setLoading(false);
      }
    }, 150);

  }, [lessonMetadata, log, logError]);

  const getLessonImage = useCallback((lessonId: string): string | null => {
    return lessonImages[lessonId] || null;
  }, [lessonImages]);

  const getLessonMetadata = useCallback((lessonId: string): LessonImageData | null => {
    return lessonMetadata[lessonId] || null;
  }, [lessonMetadata]);

  const preloadLessonImages = useCallback(async (lessonIds: string[]) => {
    await fetchLessonImages(lessonIds);
  }, [fetchLessonImages]);

  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      loadingLessonsRef.current.clear();
    };
  }, []);

  const contextValue: LessonImagesContextType = {
    lessonImages,
    lessonMetadata,
    loading,
    getLessonImage,
    getLessonMetadata,
    preloadLessonImages
  };

  return (
    <LessonImagesContext.Provider value={contextValue}>
      {children}
    </LessonImagesContext.Provider>
  );
};

export const useLessonImages = () => {
  const context = useContext(LessonImagesContext);
  if (!context) {
    throw new Error('useLessonImages deve ser usado dentro de LessonImagesProvider');
  }
  return context;
};
