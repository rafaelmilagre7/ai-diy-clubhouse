
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LearningLesson } from "@/lib/supabase/types";
import { sortLessonsByNumber } from "@/components/learning/member/course-modules/CourseModulesHelpers";
import { useAuth } from "@/contexts/auth";
import { canAccessLearningContent } from "@/utils/roleValidation";

/**
 * Hook para buscar lições de um módulo específico
 * VERSÃO CORRIGIDA: Com logging detalhado e fallback para admin
 */
export const useLessonsByModule = (moduleId: string) => {
  const { user, isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ["learning-module-lessons-v5-final", moduleId, user?.id], // Nova versão final
    queryFn: async (): Promise<LearningLesson[]> => {
      console.log(`[FORMACAO] 🔍 Buscando aulas para módulo: ${moduleId}`);

      try {
        if (!moduleId || !user?.id) {
          console.warn("[FORMACAO] ❌ Parâmetros inválidos");
          return [];
        }

        // Query corrigida com campos que existem
        const { data: allLessonsData, error } = await supabase
          .from("learning_lessons")
          .select(`
            *,
            learning_lesson_videos (
              id,
              title,
              url,
              video_type,
              video_id,
              duration_seconds,
              thumbnail_url,
              order_index,
              created_at,
              updated_at
            )
          `)
          .eq("module_id", moduleId)
          .order("order_index", { ascending: true });
        
        if (error) {
          console.error(`[FORMACAO] ❌ Erro na query:`, error);
          return [];
        }
        
        // Garantir que data é sempre um array
        const allLessons = Array.isArray(allLessonsData) ? allLessonsData : [];
        
        console.log(`[FORMACAO] 📝 Processando ${allLessons.length} aulas`);
        
        // Filtrar apenas aulas publicadas (admin vê todas)
        let lessonsToReturn = allLessons;
        if (!isAdmin) {
          lessonsToReturn = allLessons.filter(lesson => lesson.published);
        }
        
        // Converter videos para o formato esperado
        const processedLessons = lessonsToReturn.map(lesson => ({
          ...lesson,
          videos: lesson.learning_lesson_videos || []
        }));
        
        // Ordenar as aulas por número no título
        const sortedLessons = sortLessonsByNumber(processedLessons);
        
        console.log(`[FORMACAO] ✅ ${sortedLessons.length} aulas retornadas`);
        return sortedLessons;
        
      } catch (err) {
        console.error(`[FORMACAO] 💥 Exceção:`, err);
        return [];
      }
    },
    enabled: !!moduleId && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });
};
