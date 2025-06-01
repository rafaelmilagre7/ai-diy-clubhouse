
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ImplementationTrail, TrailLessonEnriched } from '@/types/implementation-trail';
import { useAuth } from '@/contexts/auth';

export const useTrailEnrichment = (trail: ImplementationTrail | null) => {
  const { user } = useAuth();
  const [enrichedLessons, setEnrichedLessons] = useState<TrailLessonEnriched[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const enrichLessons = async () => {
      if (!trail?.recommended_lessons || !user?.id) {
        setEnrichedLessons([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const lessonIds = trail.recommended_lessons.map(l => l.lessonId);
        
        if (lessonIds.length === 0) {
          setEnrichedLessons([]);
          return;
        }

        // Buscar detalhes completos das aulas
        const { data: lessons, error: lessonsError } = await supabase
          .from('learning_lessons')
          .select(`
            *,
            learning_modules(
              id,
              title,
              learning_courses(
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

        // Enriquecer aulas com dados da trilha
        const enriched: TrailLessonEnriched[] = trail.recommended_lessons
          .map(recommendation => {
            const lesson = lessons?.find(l => l.id === recommendation.lessonId);
            if (!lesson) return null;

            return {
              ...recommendation,
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              cover_image_url: lesson.cover_image_url,
              estimated_time_minutes: lesson.estimated_time_minutes,
              difficulty_level: lesson.difficulty_level,
              module: {
                id: lesson.learning_modules?.id || '',
                title: lesson.learning_modules?.title || '',
                course: {
                  id: lesson.learning_modules?.learning_courses?.id || '',
                  title: lesson.learning_modules?.learning_courses?.title || ''
                }
              }
            };
          })
          .filter(Boolean) as TrailLessonEnriched[];

        // Ordenar por prioridade
        enriched.sort((a, b) => (a.priority || 999) - (b.priority || 999));

        setEnrichedLessons(enriched);
        console.log('✅ Aulas enriquecidas:', enriched.length);

      } catch (err) {
        console.error('❌ Erro ao enriquecer aulas:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar aulas');
      } finally {
        setIsLoading(false);
      }
    };

    enrichLessons();
  }, [trail, user?.id]);

  return {
    enrichedLessons,
    isLoading,
    error
  };
};
