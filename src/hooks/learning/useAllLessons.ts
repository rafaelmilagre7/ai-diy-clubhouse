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

      // Query com ordenação hierárquica: curso > módulo > order_index > título
      const { data, error: queryError } = await supabase
        .from('learning_lessons')
        .select(`
          *,
          module:learning_modules!inner(
            *,
            course:learning_courses!inner(*)
          ),
          videos:learning_lesson_videos(*),
          resources:learning_resources(*)
        `);

      if (queryError) {
        throw queryError;
      }

      // Ordenação hierárquica manual das aulas
      const sortedData = (data || []).sort((a, b) => {
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
      setLessons(sortedData);
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