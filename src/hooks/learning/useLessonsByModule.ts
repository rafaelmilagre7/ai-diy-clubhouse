
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LearningLesson } from "@/lib/supabase/types";
import { sortLessonsByNumber } from "@/components/learning/member/course-modules/CourseModulesHelpers";
import { useAuth } from "@/contexts/auth";

/**
 * Hook para buscar lições de um módulo específico
 * VERSÃO CORRIGIDA: Com logging detalhado e fallback para admin
 */
export const useLessonsByModule = (moduleId: string) => {
  const { user, isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ["learning-module-lessons-v2-rls-fixed", moduleId, user?.id, Date.now()], // Nova chave após correção RLS
    queryFn: async (): Promise<LearningLesson[]> => {
      const startTime = performance.now();
      
      // LOGGING DETALHADO - Estado inicial após correção RLS
      console.log(`[FORMACAO_DEBUG_V2] 🔍 BUSCA PÓS-CORREÇÃO RLS`, {
        moduleId,
        userId: user?.id?.substring(0, 8) + '***' || 'sem usuário',
        isAdmin,
        userEmail: user?.email?.substring(0, 10) + '***' || 'sem email',
        timestamp: new Date().toISOString(),
        hasAuth: !!user,
        version: "v2-rls-fixed"
      });

      try {
        if (!moduleId) {
          console.warn("[FORMACAO_DEBUG_V2] ❌ ModuleId não fornecido");
          return [];
        }

        if (!user?.id) {
          console.warn("[FORMACAO_DEBUG_V2] ❌ Usuário não autenticado", {
            hasUser: !!user,
            userId: user?.id || 'null'
          });
          return [];
        }

        // VERIFICAÇÃO DE AUTENTICAÇÃO NO SUPABASE
        const { data: sessionCheck } = await supabase.auth.getSession();
        console.log(`[FORMACAO_DEBUG_V2] 🔐 Verificação de sessão pós-RLS`, {
          hasSession: !!sessionCheck?.session,
          userId: sessionCheck?.session?.user?.id?.substring(0, 8) + '***' || 'sem sessão',
          sessionValid: !!sessionCheck?.session?.access_token
        });

        console.log(`[FORMACAO_DEBUG_V2] 📋 Query com políticas RLS corrigidas...`);

        // QUERY PRINCIPAL com políticas RLS corrigidas
        const queryStart = performance.now();
        const { data: allLessonsData, error } = await supabase
          .from("learning_lessons")
          .select(`
            *,
            learning_lesson_videos (
              id,
              title,
              video_url,
              video_type,
              video_id,
              embed_code,
              duration,
              thumbnail_url,
              order_index,
              created_at,
              updated_at
            )
          `)
          .eq("module_id", moduleId)
          .order("order_index", { ascending: true });
        const queryDuration = Math.round(performance.now() - queryStart);
        
        // LOGGING DETALHADO - Resposta da query V2
        console.log(`[FORMACAO_DEBUG_V2] 📊 RESPOSTA QUERY V2`, {
          moduleId,
          hasError: !!error,
          rawDataLength: Array.isArray(allLessonsData) ? allLessonsData.length : 0,
          queryDuration: `${queryDuration}ms`,
          errorDetails: error ? {
            message: error.message,
            code: error.code,
            hint: error.hint,
            details: error.details,
            isTransactionError: error.message?.includes('read-only transaction')
          } : null
        });
        
        if (error) {
          console.error(`[FORMACAO_DEBUG_V2] ❌ ERRO após correção RLS:`, {
            error,
            moduleId,
            isAdmin,
            userId: user?.id?.substring(0, 8) + '***',
            stillHasTransactionError: error.message?.includes('read-only transaction')
          });
          
          return [];
        }
        
        // Garantir que data é sempre um array
        const allLessons = Array.isArray(allLessonsData) ? allLessonsData : [];
        
        console.log(`[FORMACAO_DEBUG_V2] 📝 PROCESSAMENTO V2`, {
          moduleId,
          totalLessons: allLessons.length,
          lessonsWithVideos: allLessons.filter(l => l.learning_lesson_videos?.length > 0).length,
          lessonDetails: allLessons.map(l => ({
            id: l.id.substring(0, 8) + '***', 
            title: l.title?.substring(0, 30) + '...' || 'sem título',
            order_index: l.order_index,
            published: l.published,
            videoCount: l.learning_lesson_videos?.length || 0
          }))
        });
        
        // Filtrar apenas aulas publicadas (admin vê todas para debug)
        let lessonsToReturn = allLessons;
        if (!isAdmin) {
          lessonsToReturn = allLessons.filter(lesson => lesson.published);
        }
        
        console.log(`[FORMACAO_DEBUG_V2] 📋 FILTRAGEM V2`, {
          moduleId,
          isAdmin,
          totalLessons: allLessons.length,
          publishedLessons: allLessons.filter(l => l.published).length,
          lessonsToReturn: lessonsToReturn.length
        });
        
        // Converter videos para o formato esperado
        const processedLessons = lessonsToReturn.map(lesson => ({
          ...lesson,
          videos: lesson.learning_lesson_videos || []
        }));
        
        // Ordenar as aulas por número no título
        const sortedLessons = sortLessonsByNumber(processedLessons);
        
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        console.log(`[FORMACAO_DEBUG_V2] ✅ SUCESSO V2 - RLS CORRIGIDO`, {
          moduleId,
          finalLessonsCount: sortedLessons.length,
          totalDuration: `${duration}ms`,
          isAdmin,
          version: "v2-rls-fixed",
          rlsWorking: true
        });
        
        return sortedLessons;
      } catch (err) {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        console.error(`[FORMACAO_DEBUG_V2] 💥 EXCEÇÃO V2`, {
          moduleId,
          duration: `${duration}ms`,
          isAdmin,
          userId: user?.id?.substring(0, 8) + '***',
          errorType: err instanceof Error ? err.constructor.name : typeof err,
          errorMessage: err instanceof Error ? err.message : String(err),
          version: "v2-rls-fixed"
        });
        
        return [];
      }
    },
    enabled: !!moduleId && !!user, // Garantir que usuário existe
    staleTime: 0, // Cache bust total
    refetchOnWindowFocus: true,
    refetchOnMount: true, // Força refresh ao montar
    retry: (failureCount, error) => {
      console.log(`[FORMACAO_DEBUG_V2] 🔄 RETRY V2 ${failureCount}`, {
        moduleId,
        errorMessage: error instanceof Error ? error.message : String(error),
        isAdmin,
        maxRetries: 3
      });
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * Math.pow(2, attemptIndex), 5000);
      console.log(`[FORMACAO_DEBUG_V2] ⏱️ RETRY DELAY V2: ${delay}ms`);
      return delay;
    },
    gcTime: 0 // Cache bust total
  });
};
