
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';

interface LessonImageData {
  id: string;
  thumbnail_url?: string;
  cover_image?: string;
  title: string;
}

export const useLessonImages = () => {
  const [lessonImages, setLessonImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { log, logError } = useLogging();

  const fetchLessonImages = async (lessonIds: string[]) => {
    if (lessonIds.length === 0) return;

    try {
      setLoading(true);
      log('Buscando imagens das aulas', { lessonIds });

      const { data, error } = await supabase
        .from('lessons')
        .select('id, thumbnail_url, cover_image, title')
        .in('id', lessonIds);

      if (error) {
        throw error;
      }

      const imagesMap = data?.reduce((acc, lesson: LessonImageData) => {
        // Usar thumbnail_url ou cover_image, o que estiver disponível
        const imageUrl = lesson.thumbnail_url || lesson.cover_image;
        if (imageUrl) {
          acc[lesson.id] = imageUrl;
        }
        return acc;
      }, {} as Record<string, string>) || {};

      setLessonImages(prev => ({ ...prev, ...imagesMap }));
      log('Imagens das aulas carregadas', { count: Object.keys(imagesMap).length });

    } catch (error) {
      logError('Erro ao buscar imagens das aulas', error);
    } finally {
      setLoading(false);
    }
  };

  const getLessonImage = (lessonId: string): string | null => {
    return lessonImages[lessonId] || null;
  };

  const preloadLessonImages = (lessonIds: string[]) => {
    // Verificar quais imagens ainda não foram carregadas
    const missingIds = lessonIds.filter(id => !lessonImages[id]);
    if (missingIds.length > 0) {
      fetchLessonImages(missingIds);
    }
  };

  return {
    lessonImages,
    loading,
    getLessonImage,
    fetchLessonImages,
    preloadLessonImages
  };
};
