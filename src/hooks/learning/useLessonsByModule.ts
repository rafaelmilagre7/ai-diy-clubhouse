
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
        
        // Ordenar as aulas por número no título
        return sortLessonsByNumber(lessons);
      } catch (err) {
        console.error("Erro inesperado ao buscar lições:", err);
        return [];
      }
    },
    enabled: !!moduleId
  });
};
