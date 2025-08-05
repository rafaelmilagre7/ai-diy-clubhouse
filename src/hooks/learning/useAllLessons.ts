import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LearningLessonWithRelations } from '@/lib/supabase/types/extended';

interface UseAllLessonsResult {
  lessons: LearningLessonWithRelations[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAllLessons = (): UseAllLessonsResult => {
  const [lessons, setLessons] = useState<LearningLessonWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query otimizada: buscar todos os campos necessários
      const { data, error: queryError } = await supabase
        .from('learning_lessons')
        .select(`
          *,
          module:learning_modules(
            id,
            title,
            course_id,
            order_index,
            course:learning_courses(
              id,
              title,
              slug,
              published
            )
          )
        `)
        .eq('published', true)
        .order('order_index', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      // Buscar vídeos e recursos separadamente para evitar query complexa
      let lessonsWithRelations = data || [];
      
      if (data && data.length > 0) {
        const lessonIds = data.map(lesson => lesson.id);
        
        const [videosResult, resourcesResult] = await Promise.all([
          supabase
            .from('learning_lesson_videos')
            .select('*')
            .in('lesson_id', lessonIds)
            .order('order_index', { ascending: true }),
          supabase
            .from('learning_resources')
            .select('*')
            .in('lesson_id', lessonIds)
            .order('order_index', { ascending: true })
        ]);

        // Associar vídeos e recursos às aulas
        lessonsWithRelations = data.map(lesson => ({
          ...lesson,
          videos: videosResult.data?.filter(video => video.lesson_id === lesson.id) || [],
          resources: resourcesResult.data?.filter(resource => resource.lesson_id === lesson.id) || []
        }));

        console.log('useAllLessons: Query otimizada executada com sucesso');
      }

      // Ordenação hierárquica manual das aulas
      const sortedData = lessonsWithRelations.sort((a, b) => {
        // 1. Primeiro ordenar por curso
        const courseA = (a.module as any)?.course?.title || '';
        const courseB = (b.module as any)?.course?.title || '';
        if (courseA !== courseB) {
          return courseA.localeCompare(courseB, 'pt-BR');
        }

        // 2. Depois por módulo
        const moduleA = (a.module as any)?.title || '';
        const moduleB = (b.module as any)?.title || '';
        if (moduleA !== moduleB) {
          return moduleA.localeCompare(moduleB, 'pt-BR');
        }

        // 3. Depois por order_index (se existir)
        const orderA = a.order_index || 999;
        const orderB = b.order_index || 999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }

        // 4. Por último, por título da aula
        return (a.title || '').localeCompare(b.title || '', 'pt-BR');
      });

      console.log('useAllLessons: Aulas carregadas e ordenadas:', sortedData?.length || 0);
      setLessons(sortedData as LearningLessonWithRelations[]);
    } catch (err) {
      console.error('useAllLessons: Erro ao buscar aulas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  return {
    lessons,
    loading,
    error,
    refetch: fetchLessons
  };
};