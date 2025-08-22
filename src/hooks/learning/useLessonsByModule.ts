
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
      const startTime = performance.now();
      console.log(`[FORMACAO_DEBUG] Iniciando busca de aulas - moduleId: ${moduleId}, timestamp: ${new Date().toISOString()}`);
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
        
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        console.log(`[FORMACAO_DEBUG] Busca concluída com sucesso - moduleId: ${moduleId}, aulas: ${sortedLessons.length}, duração: ${duration}ms`);
        
        return sortedLessons;
      } catch (err) {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        console.error(`[FORMACAO_DEBUG] ERRO na busca de aulas - moduleId: ${moduleId}, duração: ${duration}ms, erro:`, err);
        return [];
      }
    },
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      console.log(`[FORMACAO_DEBUG] Tentativa de retry ${failureCount} para moduleId: ${moduleId}`, error);
      return failureCount < 3; // Máximo 3 tentativas
    },
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * Math.pow(2, attemptIndex), 10000); // Exponential backoff
      console.log(`[FORMACAO_DEBUG] Aguardando ${delay}ms antes do retry para moduleId: ${moduleId}`);
      return delay;
    },
    gcTime: 10 * 60 * 1000 // 10 minutos de cache
  });
};
