import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LearningLesson, LessonTag } from '@/lib/supabase/types/learning';

export interface LessonWithTags extends LearningLesson {
  learning_modules: {
    id: string;
    title: string;
    course_id: string;
  };
  lesson_tags: {
    lesson_tags: LessonTag;
  }[];
}

interface UseLessonsWithTagsOptions {
  courseId?: string;
  selectedTagIds?: string[];
  searchTerm?: string;
  includeUnpublished?: boolean;
}

export const useLessonsWithTags = (options: UseLessonsWithTagsOptions = {}) => {
  const { courseId, selectedTagIds = [], searchTerm = '', includeUnpublished = false } = options;

  return useQuery({
    queryKey: ['lessons-with-tags', courseId, selectedTagIds, searchTerm, includeUnpublished],
    queryFn: async () => {
      let query = supabase
        .from('learning_lessons')
        .select(`
          *,
          learning_modules!inner(
            id,
            title,
            course_id
          ),
          learning_lesson_tags(
            lesson_tags(*)
          )
        `);

      // Filtrar apenas publicadas se não for para incluir não publicadas
      if (!includeUnpublished) {
        query = query.eq('published', true);
      }

      // Filtro por curso se especificado
      if (courseId) {
        query = query.eq('learning_modules.course_id', courseId);
      }

      // Busca por texto no título ou descrição
      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }

      const { data: lessons, error } = await query.order('order_index');

      if (error) throw error;

      let filteredLessons = lessons as LessonWithTags[];

      // Filtro por tags selecionadas
      if (selectedTagIds.length > 0) {
        filteredLessons = filteredLessons.filter(lesson =>
          lesson.lesson_tags.some(lt =>
            selectedTagIds.includes(lt.lesson_tags.id)
          )
        );
      }

      return filteredLessons;
    }
  });
};

// Hook para contar aulas por tag
export const useLessonCountsByTag = (courseId?: string) => {
  return useQuery({
    queryKey: ['lesson-counts-by-tag', courseId],
    queryFn: async () => {
      let query = supabase
        .from('learning_lesson_tags')
        .select(`
          tag_id,
          lesson_tags(id, name),
          learning_lessons!inner(
            id,
            learning_modules!inner(
              course_id
            )
          )
        `);

      // Filtro por curso se especificado
      if (courseId) {
        query = query.eq('learning_lessons.learning_modules.course_id', courseId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Contar aulas por tag
      const counts: Record<string, number> = {};
      data.forEach(item => {
        const tagId = item.tag_id;
        counts[tagId] = (counts[tagId] || 0) + 1;
      });

      return counts;
    }
  });
};