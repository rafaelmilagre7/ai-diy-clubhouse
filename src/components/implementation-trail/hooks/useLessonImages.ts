
import { useState, useEffect, useCallback, useRef } from 'react';
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

export const useLessonImages = () => {
  const [lessonImages, setLessonImages] = useState<Record<string, string>>({});
  const [lessonMetadata, setLessonMetadata] = useState<Record<string, LessonImageData>>({});
  const [loading, setLoading] = useState(false);
  const { log, logError } = useLogging();
  
  // Ref para controlar requisições em andamento e evitar duplicatas
  const loadingLessonsRef = useRef<Set<string>>(new Set());
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  // Memorizar a função fetchLessonImages para evitar loop infinito
  const fetchLessonImages = useCallback(async (lessonIds: string[]) => {
    if (lessonIds.length === 0) return;

    // Filtrar apenas IDs que ainda não foram carregados e não estão sendo carregados
    const missingIds = lessonIds.filter(id => 
      !lessonMetadata[id] && !loadingLessonsRef.current.has(id)
    );

    if (missingIds.length === 0) return;

    // Debounce para evitar múltiplas chamadas simultâneas
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        
        // Marcar os IDs como sendo carregados
        missingIds.forEach(id => loadingLessonsRef.current.add(id));
        
        log('Buscando imagens e metadados das aulas', { lessonIds: missingIds });

        const { data, error } = await supabase
          .from('learning_lessons')
          .select('id, cover_image_url, title, estimated_time_minutes, difficulty_level, description')
          .in('id', missingIds);

        if (error) {
          throw error;
        }

        const imagesMap = data?.reduce((acc, lesson: LessonImageData) => {
          if (lesson.cover_image_url) {
            acc[lesson.id] = lesson.cover_image_url;
          }
          return acc;
        }, {} as Record<string, string>) || {};

        const metadataMap = data?.reduce((acc, lesson: LessonImageData) => {
          acc[lesson.id] = lesson;
          return acc;
        }, {} as Record<string, LessonImageData>) || {};

        // Atualizar estados de forma otimizada
        setLessonImages(prev => ({ ...prev, ...imagesMap }));
        setLessonMetadata(prev => ({ ...prev, ...metadataMap }));
        
        log('Imagens e metadados das aulas carregados', { count: Object.keys(imagesMap).length });

      } catch (error) {
        logError('Erro ao buscar imagens das aulas', error);
      } finally {
        // Remover os IDs do conjunto de carregamento
        missingIds.forEach(id => loadingLessonsRef.current.delete(id));
        setLoading(false);
      }
    }, 150); // Debounce de 150ms

  }, [lessonMetadata, log, logError]);

  const getLessonImage = useCallback((lessonId: string): string | null => {
    return lessonImages[lessonId] || null;
  }, [lessonImages]);

  const getLessonMetadata = useCallback((lessonId: string): LessonImageData | null => {
    return lessonMetadata[lessonId] || null;
  }, [lessonMetadata]);

  const preloadLessonImages = useCallback((lessonIds: string[]) => {
    fetchLessonImages(lessonIds);
  }, [fetchLessonImages]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      loadingLessonsRef.current.clear();
    };
  }, []);

  return {
    lessonImages,
    lessonMetadata,
    loading,
    getLessonImage,
    getLessonMetadata,
    fetchLessonImages,
    preloadLessonImages
  };
};
