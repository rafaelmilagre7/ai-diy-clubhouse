
import { useState, useEffect } from 'react';
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

  const fetchLessonImages = async (lessonIds: string[]) => {
    if (lessonIds.length === 0) return;

    try {
      setLoading(true);
      log('Buscando imagens e metadados das aulas', { lessonIds });

      // Corrigido: usar learning_lessons e campos corretos
      const { data, error } = await supabase
        .from('learning_lessons')
        .select('id, cover_image_url, title, estimated_time_minutes, difficulty_level, description')
        .in('id', lessonIds);

      if (error) {
        throw error;
      }

      const imagesMap = data?.reduce((acc, lesson: LessonImageData) => {
        // Usar apenas cover_image_url
        if (lesson.cover_image_url) {
          acc[lesson.id] = lesson.cover_image_url;
        }
        return acc;
      }, {} as Record<string, string>) || {};

      const metadataMap = data?.reduce((acc, lesson: LessonImageData) => {
        acc[lesson.id] = lesson;
        return acc;
      }, {} as Record<string, LessonImageData>) || {};

      setLessonImages(prev => ({ ...prev, ...imagesMap }));
      setLessonMetadata(prev => ({ ...prev, ...metadataMap }));
      log('Imagens e metadados das aulas carregados', { count: Object.keys(imagesMap).length });

    } catch (error) {
      logError('Erro ao buscar imagens das aulas', error);
    } finally {
      setLoading(false);
    }
  };

  const getLessonImage = (lessonId: string): string | null => {
    return lessonImages[lessonId] || null;
  };

  const getLessonMetadata = (lessonId: string): LessonImageData | null => {
    return lessonMetadata[lessonId] || null;
  };

  const preloadLessonImages = (lessonIds: string[]) => {
    // Verificar quais imagens ainda não foram carregadas
    const missingIds = lessonIds.filter(id => !lessonMetadata[id]);
    if (missingIds.length > 0) {
      fetchLessonImages(missingIds);
    }
  };

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
