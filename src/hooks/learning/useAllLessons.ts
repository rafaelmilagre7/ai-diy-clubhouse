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

      // Query direta para admin - busca todas as aulas com informações de módulo e curso
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
        `)
        .order('created_at', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      console.log('useAllLessons: Aulas carregadas:', data?.length || 0);
      setLessons(data || []);
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