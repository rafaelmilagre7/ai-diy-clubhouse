
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
    queryKey: ["learning-module-lessons", moduleId, Date.now()], // Cache busting
    queryFn: async (): Promise<LearningLesson[]> => {
      const startTime = performance.now();
      
      // LOGGING DETALHADO - Estado inicial
      console.log(`[FORMACAO_DEBUG] 🔍 INÍCIO DA BUSCA DE AULAS`, {
        moduleId,
        userId: user?.id?.substring(0, 8) + '***' || 'sem usuário',
        isAdmin,
        userEmail: user?.email?.substring(0, 10) + '***' || 'sem email',
        timestamp: new Date().toISOString(),
        hasAuth: !!user
      });

      try {
        if (!moduleId) {
          console.warn("[FORMACAO_DEBUG] ❌ ModuleId não fornecido");
          return [];
        }

        if (!user?.id) {
          console.warn("[FORMACAO_DEBUG] ❌ Usuário não autenticado", {
            hasUser: !!user,
            userId: user?.id || 'null'
          });
          return [];
        }

        // VERIFICAÇÃO DE AUTENTICAÇÃO NO SUPABASE
        const { data: sessionCheck } = await supabase.auth.getSession();
        console.log(`[FORMACAO_DEBUG] 🔐 Verificação de sessão`, {
          hasSession: !!sessionCheck?.session,
          userId: sessionCheck?.session?.user?.id?.substring(0, 8) + '***' || 'sem sessão',
          sessionValid: !!sessionCheck?.session?.access_token
        });

        console.log(`[FORMACAO_DEBUG] 📋 Executando query para módulo ${moduleId}...`);

        // QUERY PRINCIPAL com logging detalhado
        const queryStart = performance.now();
        const { data: allLessonsData, error } = await supabase
          .from("learning_lessons")
          .select("*, videos:learning_lesson_videos(*)")
          .eq("module_id", moduleId)
          .order("order_index", { ascending: true });
        const queryDuration = Math.round(performance.now() - queryStart);
        
        // LOGGING DETALHADO - Resposta da query
        console.log(`[FORMACAO_DEBUG] 📊 RESPOSTA DA QUERY`, {
          moduleId,
          hasError: !!error,
          rawDataLength: Array.isArray(allLessonsData) ? allLessonsData.length : 0,
          queryDuration: `${queryDuration}ms`,
          errorDetails: error ? {
            message: error.message,
            code: error.code,
            hint: error.hint,
            details: error.details
          } : null
        });
        
        if (error) {
          console.error(`[FORMACAO_DEBUG] ❌ ERRO CRÍTICO na query:`, {
            error,
            moduleId,
            isAdmin,
            userId: user?.id?.substring(0, 8) + '***'
          });
          
          // FALLBACK PARA ADMIN - Tentar query com privilégios elevados
          if (isAdmin) {
            console.log(`[FORMACAO_DEBUG] 🔧 TENTANDO FALLBACK DE ADMIN...`);
            try {
              const { data: adminData, error: adminError } = await supabase
                .from("learning_lessons")
                .select("*, videos:learning_lesson_videos(*)")
                .eq("module_id", moduleId)
                .order("order_index", { ascending: true });
                
              if (adminError) {
                console.error(`[FORMACAO_DEBUG] ❌ FALLBACK ADMIN FALHOU:`, adminError);
              } else {
                console.log(`[FORMACAO_DEBUG] ✅ FALLBACK ADMIN SUCESSO:`, {
                  adminDataLength: Array.isArray(adminData) ? adminData.length : 0
                });
                // Continuar processamento com dados do admin
                const allLessons = Array.isArray(adminData) ? adminData : [];
                const publishedLessons = allLessons.filter(lesson => lesson.published);
                const sortedLessons = sortLessonsByNumber(publishedLessons);
                
                console.log(`[FORMACAO_DEBUG] ✅ ADMIN FALLBACK - Retornando ${sortedLessons.length} aulas`);
                return sortedLessons;
              }
            } catch (adminErr) {
              console.error(`[FORMACAO_DEBUG] ❌ EXCEÇÃO NO FALLBACK ADMIN:`, adminErr);
            }
          }
          
          return [];
        }
        
        // Garantir que data é sempre um array
        const allLessons = Array.isArray(allLessonsData) ? allLessonsData : [];
        
        console.log(`[FORMACAO_DEBUG] 📝 PROCESSANDO DADOS`, {
          moduleId,
          totalLessons: allLessons.length,
          lessonDetails: allLessons.map(l => ({
            id: l.id.substring(0, 8) + '***', 
            title: l.title?.substring(0, 30) + '...' || 'sem título',
            order_index: l.order_index,
            published: l.published,
            hasVideos: Array.isArray(l.videos) ? l.videos.length : 0
          }))
        });
        
        // Filtrar apenas aulas publicadas (admin vê todas para debug)
        let lessonsToReturn = allLessons;
        if (!isAdmin) {
          lessonsToReturn = allLessons.filter(lesson => lesson.published);
        }
        
        console.log(`[FORMACAO_DEBUG] 📋 FILTRAGEM`, {
          moduleId,
          isAdmin,
          totalLessons: allLessons.length,
          publishedLessons: allLessons.filter(l => l.published).length,
          lessonsToReturn: lessonsToReturn.length
        });
        
        // Ordenar as aulas por número no título e garantir consistência
        const sortedLessons = sortLessonsByNumber(lessonsToReturn);
        
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        console.log(`[FORMACAO_DEBUG] ✅ SUCESSO COMPLETO`, {
          moduleId,
          finalLessonsCount: sortedLessons.length,
          totalDuration: `${duration}ms`,
          isAdmin,
          sortedLessonTitles: sortedLessons.map(l => l.title?.substring(0, 30) + '...')
        });
        
        return sortedLessons;
      } catch (err) {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        console.error(`[FORMACAO_DEBUG] 💥 EXCEÇÃO CRÍTICA`, {
          moduleId,
          duration: `${duration}ms`,
          isAdmin,
          userId: user?.id?.substring(0, 8) + '***',
          errorType: err instanceof Error ? err.constructor.name : typeof err,
          errorMessage: err instanceof Error ? err.message : String(err),
          stackTrace: err instanceof Error ? err.stack?.split('\n').slice(0, 3) : null
        });
        
        return [];
      }
    },
    enabled: !!moduleId && !!user, // Garantir que usuário existe
    staleTime: 0, // Sem cache para debug
    refetchOnWindowFocus: true, // Forçar refresh
    retry: (failureCount, error) => {
      console.log(`[FORMACAO_DEBUG] 🔄 RETRY ${failureCount}`, {
        moduleId,
        errorMessage: error instanceof Error ? error.message : String(error),
        isAdmin,
        maxRetries: 5
      });
      return failureCount < 5; // Mais tentativas para admin
    },
    retryDelay: (attemptIndex) => {
      const delay = Math.min(500 * Math.pow(1.5, attemptIndex), 5000); // Delay menor e mais agressivo
      console.log(`[FORMACAO_DEBUG] ⏱️ RETRY DELAY: ${delay}ms (tentativa ${attemptIndex + 1})`);
      return delay;
    },
    gcTime: 0 // Sem cache para debug
  });
};
