import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LearningLesson } from '@/lib/supabase/types/learning';

interface LMSStructureRow {
  curso: string;
  modulo: string;
  aula: string;
  statusCurso: string;
  statusModulo: string;
  statusAula: string;
  ordemCurso: number;
  ordemModulo: number;
  ordemAula: number;
}

interface ModuleData {
  id: string;
  title: string;
  published: boolean;
  order_index: number;
  learning_courses?: {
    id: string;
    title: string;
    published: boolean;
    order_index: number;
  } | null;
}

interface LessonWithRelations extends LearningLesson {
  learning_modules?: ModuleData | null;
}

export const useLMSStructure = () => {
  return useQuery({
    queryKey: ['lms-structure'],
    queryFn: async (): Promise<LMSStructureRow[]> => {
      const { data, error } = await supabase
        .from('learning_lessons')
        .select(`
          id,
          title,
          published,
          order_index,
          learning_modules!learning_lessons_module_id_fkey (
            id,
            title,
            published,
            order_index,
            learning_courses!learning_modules_course_id_fkey (
              id,
              title,
              published,
              order_index
            )
          )
        `)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Erro ao buscar estrutura do LMS:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Transformar dados para formato CSV
      const structuredData: LMSStructureRow[] = (data as unknown as LessonWithRelations[]).map((lesson) => {
        const module = lesson.learning_modules;
        const course = module?.learning_courses;

        return {
          curso: course?.title || 'Curso não informado',
          modulo: module?.title || 'Módulo não informado',
          aula: lesson.title || 'Aula não informada',
          statusCurso: course?.published ? 'Publicado' : 'Rascunho',
          statusModulo: module?.published ? 'Publicado' : 'Rascunho',
          statusAula: lesson.published ? 'Publicado' : 'Rascunho',
          ordemCurso: course?.order_index ?? 0,
          ordemModulo: module?.order_index ?? 0,
          ordemAula: lesson.order_index ?? 0,
        };
      });

      // Ordenar por curso, módulo e aula
      structuredData.sort((a, b) => {
        if (a.ordemCurso !== b.ordemCurso) return a.ordemCurso - b.ordemCurso;
        if (a.ordemModulo !== b.ordemModulo) return a.ordemModulo - b.ordemModulo;
        return a.ordemAula - b.ordemAula;
      });

      return structuredData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
