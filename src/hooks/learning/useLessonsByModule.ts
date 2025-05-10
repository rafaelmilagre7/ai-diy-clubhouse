
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

        const { data, error } = await supabase
          .from("learning_lessons")
          .select("*, videos:learning_lesson_videos(*)")
          .eq("module_id", moduleId)
          .eq("published", true)
          .order("order_index", { ascending: true });
          
        if (error) {
          console.error("Erro ao buscar lições do módulo:", error);
          return [];
        }
        
        // Garantir que data é sempre um array
        const lessons = Array.isArray(data) ? data : [];
        
        // Fazer um log detalhado para depuração das aulas encontradas
        console.log(`Encontradas ${lessons.length} aulas para o módulo ${moduleId}:`, 
          lessons.map(l => ({
            id: l.id, 
            title: l.title, 
            order_index: l.order_index,
            published: l.published
          }))
        );
        
        // Ordenar as aulas por número no título e garantir consistência
        const sortedLessons = sortLessonsByNumber(lessons);
        
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
    enabled: !!moduleId
  });
};
