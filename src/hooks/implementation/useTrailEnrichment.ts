
import { useState, useEffect } from 'react';
import { ImplementationTrail, TrailLessonEnriched } from '@/types/implementation-trail';
import { supabase } from '@/integrations/supabase/client';

export const useTrailEnrichment = (trail: ImplementationTrail | null) => {
  const [enrichedLessons, setEnrichedLessons] = useState<TrailLessonEnriched[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const enrichLessons = async () => {
      if (!trail?.recommended_lessons || trail.recommended_lessons.length === 0) {
        setEnrichedLessons([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const lessonIds = trail.recommended_lessons.map(l => l.lessonId);

        // Buscar detalhes das aulas com módulos e cursos
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('learning_lessons')
          .select(`
            *,
            module:learning_modules!inner(
              id,
              title,
              course:learning_courses!inner(
                id,
                title
              )
            )
          `)
          .in('id', lessonIds)
          .eq('published', true);

        if (lessonsError) {
          throw lessonsError;
        }

        // Enriquecer com dados da trilha
        const enriched: TrailLessonEnriched[] = trail.recommended_lessons
          .map(trailLesson => {
            const lesson = lessonsData?.find(l => l.id === trailLesson.lessonId);
            if (lesson && lesson.module) {
              return {
                ...trailLesson,
                ...lesson,
                module: lesson.module
              };
            }
            return null;
          })
          .filter(Boolean) as TrailLessonEnriched[];

        setEnrichedLessons(enriched);
      } catch (err) {
        console.error('Erro ao enriquecer aulas da trilha:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    enrichLessons();
  }, [trail]);

  return {
    enrichedLessons,
    isLoading,
    error
  };
};
