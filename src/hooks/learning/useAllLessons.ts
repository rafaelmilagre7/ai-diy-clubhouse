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

      const { data, error: queryError } = await supabase
        .from('learning_lessons_with_relations')
        .select('*')
        .order('module_order_index', { ascending: true })
        .order('order_index', { ascending: true });

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