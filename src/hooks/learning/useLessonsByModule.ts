
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LearningLesson } from "@/lib/supabase/types";
import { sortLessonsByNumber } from "@/components/learning/member/course-modules/CourseModulesHelpers";

/**
 * Hook para buscar lições de um módulo específico
 */
export const useLessonsByModule = (moduleId: string) => {
  return useQuery({
    queryKey: ["learning-module-lessons", moduleId],
    queryFn: async (): Promise<LearningLesson[]> => {
      try {
        if (!moduleId) {
          console.log("useLessonsByModule: moduleId não fornecido");
          return [];
        }

        console.log(`Buscando aulas para o módulo ${moduleId}...`);

        // Buscar todas as aulas do módulo (incluindo não publicadas para debug)
        const { data: allLessonsData, error } = await supabase
          .from("learning_lessons")
          .select("*, videos:learning_lesson_videos(*)")
          .eq("module_id", moduleId)
          .order("order_index", { ascending: true });
          
        if (error) {
          console.error("Erro ao buscar lições do módulo:", error);
          return [];
        }
        
        // Garantir que data é sempre um array
        const allLessons = Array.isArray(allLessonsData) ? allLessonsData : [];
        
        console.log(`Total de aulas encontradas no módulo ${moduleId}:`, allLessons.length);
        console.log("Status das aulas:", 
          allLessons.map(l => ({
            id: l.id, 
            title: l.title, 
            order_index: l.order_index,
            published: l.published
          }))
        );
        
        // Filtrar apenas aulas publicadas
        const publishedLessons = allLessons.filter(lesson => lesson.published);
        
        console.log(`Aulas publicadas no módulo ${moduleId}:`, publishedLessons.length);
        
        // Ordenar as aulas por número no título e garantir consistência
        const sortedLessons = sortLessonsByNumber(publishedLessons);
        
        console.log(`Aulas ordenadas para o módulo ${moduleId}:`, 
          sortedLessons.map(l => ({
            id: l.id, 
            title: l.title, 
            order_index: l.order_index
          }))
        );
        
        return sortedLessons;
      } catch (err) {
        console.error("Erro inesperado ao buscar lições:", err);
        return [];
      }
    },
    enabled: !!moduleId,
    // Forçar refetch para garantir dados atualizados
    staleTime: 0,
    refetchOnWindowFocus: true
  });
};
