
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ImplementationTrail, TrailLessonEnriched } from '@/types/implementation-trail';

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

        const lessonIds = trail.recommended_lessons.map(lesson => lesson.lessonId);

        const { data: lessons, error: lessonsError } = await supabase
          .from('learning_lessons')
          .select(`
            id,
            title,
            description,
            cover_image_url,
            estimated_time_minutes,
            difficulty_level,
            module_id,
            learning_modules!inner(
              id,
              title,
              learning_courses!inner(
                id,
                title
              )
            )
          `)
          .in('id', lessonIds);

        if (lessonsError) {
          console.error('Erro ao buscar aulas:', lessonsError);
          throw lessonsError;
        }

        if (!lessons) {
          setEnrichedLessons([]);
          return;
        }

        // Enriquecer as aulas com dados da trilha
        const enriched: TrailLessonEnriched[] = lessons.map(lesson => {
          const trailLesson = trail.recommended_lessons!.find(tl => tl.lessonId === lesson.id);
          
          return {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            cover_image_url: lesson.cover_image_url,
            estimated_time_minutes: lesson.estimated_time_minutes || 0,
            difficulty_level: lesson.difficulty_level,
            lessonId: lesson.id,
            moduleId: lesson.module_id,
            courseId: lesson.learning_modules.learning_courses.id,
            justification: trailLesson?.justification,
            priority: trailLesson?.priority || 1,
            module: {
              id: lesson.learning_modules.id,
              title: lesson.learning_modules.title,
              course: {
                id: lesson.learning_modules.learning_courses.id,
                title: lesson.learning_modules.learning_courses.title
              }
            }
          };
        });

        // Ordenar por prioridade
        enriched.sort((a, b) => (a.priority || 1) - (b.priority || 1));

        setEnrichedLessons(enriched);
      } catch (err) {
        console.error('Erro ao enriquecer aulas da trilha:', err);
        setError('Erro ao carregar aulas recomendadas');
        setEnrichedLessons([]);
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
