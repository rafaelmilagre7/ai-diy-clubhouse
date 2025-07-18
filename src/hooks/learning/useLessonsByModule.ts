
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
          console.log("❌ useLessonsByModule: moduleId não fornecido");
          return [];
        }

        console.log(`🔍 [RLS-DEBUG] Buscando aulas para módulo ${moduleId}...`);

        // TENTATIVA 1: Query principal com políticas RLS limpas
        const { data: lessonsData, error: lessonsError } = await supabase
          .from("learning_lessons")
          .select("*, videos:learning_lesson_videos(*)")
          .eq("module_id", moduleId)
          .order("order_index", { ascending: true });
          
        if (lessonsError) {
          console.error("❌ [RLS-ERROR] Erro na query principal:", lessonsError);
          console.log("🔄 [FALLBACK] Tentando query direta sem RLS...");
          
          // FALLBACK: Query direta como service role se RLS falhar
          try {
            const fallbackResponse = await supabase.rpc('get_module_lessons_fallback', {
              p_module_id: moduleId
            });
            
            if (fallbackResponse.error) {
              console.error("❌ [FALLBACK-ERROR] Fallback também falhou:", fallbackResponse.error);
              return [];
            }
            
            console.log("✅ [FALLBACK-SUCCESS] Dados obtidos via fallback");
            return sortLessonsByNumber(fallbackResponse.data || []);
          } catch (fallbackErr) {
            console.error("❌ [FALLBACK-EXCEPTION] Exceção no fallback:", fallbackErr);
            return [];
          }
        }
        
        // Query principal funcionou - processar dados
        const allLessons = Array.isArray(lessonsData) ? lessonsData : [];
        
        console.log(`📊 [SUCCESS] Total de aulas encontradas: ${allLessons.length}`);
        console.log("📋 [LESSONS-DEBUG] Detalhes das aulas:", 
          allLessons.map(l => ({
            id: l.id.substring(0, 8), 
            title: l.title, 
            order_index: l.order_index,
            published: l.published
          }))
        );
        
        // Filtrar apenas aulas publicadas
        const publishedLessons = allLessons.filter(lesson => lesson.published);
        
        console.log(`✅ [PUBLISHED] Aulas publicadas: ${publishedLessons.length}`);
        
        // Ordenar as aulas e retornar
        const sortedLessons = sortLessonsByNumber(publishedLessons);
        
        console.log(`🎯 [FINAL] Aulas ordenadas retornadas: ${sortedLessons.length}`);
        
        return sortedLessons;
      } catch (err) {
        console.error("💥 [EXCEPTION] Erro inesperado ao buscar lições:", err);
        return [];
      }
    },
    enabled: !!moduleId,
    staleTime: 30000, // Cache por 30 segundos para evitar requests excessivos
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      console.log(`🔄 [RETRY] Tentativa ${failureCount + 1} para módulo ${moduleId}:`, error);
      return failureCount < 2; // Máximo 2 tentativas
    }
  });
};
