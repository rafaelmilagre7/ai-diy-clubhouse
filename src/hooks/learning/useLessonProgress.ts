
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { 
  showModernLoading, 
  showModernSuccess, 
  showModernError,
  dismissModernToast 
} from "@/lib/toast-helpers";
import { LESSON_PROGRESS, isLessonCompleted } from "@/utils/lessonProgressUtils";

interface UseLessonProgressProps {
  lessonId?: string;
}

export function useLessonProgress({ lessonId }: UseLessonProgressProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const queryClient = useQueryClient();
  const progressInitialized = useRef(false);

  // Buscar progresso atual da lição
  const { 
    data: userProgress,
    refetch: refetchProgress,
    isLoading: isLoadingProgress
  } = useQuery({
    queryKey: ["learning-lesson-progress", lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      
      const { data, error } = await supabase
        .from("learning_progress")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error("[LESSON-PROGRESS] ❌ Erro ao carregar progresso:", error);
        return null;
      }
      
      if (data) {
        const completed = isLessonCompleted(data.progress_percentage);
        setIsCompleted(completed);
        progressInitialized.current = true;
        
        console.log("[LESSON-PROGRESS] 📊 Progresso carregado:", {
          lessonId,
          progress_percentage: data.progress_percentage,
          completed
        });
      }
      
      return data;
    },
    enabled: !!lessonId,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000 // 5 minutos
  });
  
  // Mutation para atualizar progresso com toasts e retry
  const updateProgressMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      if (!lessonId) throw new Error("ID da lição não fornecido");
      
      console.log("[LESSON-PROGRESS] 🎯 Iniciando atualização:", {
        lessonId,
        completed,
        timestamp: new Date().toISOString()
      });
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const timestamp = new Date().toISOString();
      const progressPercentage = completed ? LESSON_PROGRESS.COMPLETED : LESSON_PROGRESS.STARTED;
      
      // UPSERT otimizado
      const { data, error } = await supabase
        .from("learning_progress")
        .upsert({
          user_id: userData.user.id,
          lesson_id: lessonId,
          progress_percentage: progressPercentage,
          started_at: userProgress?.started_at || timestamp,
          updated_at: timestamp,
          completed_at: completed ? timestamp : null,
          last_position_seconds: userProgress?.last_position_seconds || 0,
          video_progress: userProgress?.video_progress || {}
        }, {
          onConflict: 'user_id,lesson_id',
          ignoreDuplicates: false
        })
        .select()
        .single();
        
      if (error) {
        console.error("[LESSON-PROGRESS] ❌ Erro no UPSERT:", error);
        
        // Fallback para UPDATE se UPSERT falhar
        if (error.code === '23505') {
          console.log("[LESSON-PROGRESS] 🔄 Tentando UPDATE como fallback");
          
          const { data: updateData, error: updateError } = await supabase
            .from("learning_progress")
            .update({ 
              progress_percentage: progressPercentage,
              updated_at: timestamp,
              completed_at: completed ? timestamp : userProgress?.completed_at
            })
            .eq("user_id", userData.user.id)
            .eq("lesson_id", lessonId)
            .select()
            .single();
            
          if (updateError) {
            console.error("[LESSON-PROGRESS] ❌ Erro no UPDATE:", updateError);
            throw updateError;
          }
          
          console.log("[LESSON-PROGRESS] ✅ UPDATE bem-sucedido");
          return { ...updateData, completed };
        }
        throw error;
      }
      
      console.log("[LESSON-PROGRESS] ✅ Progresso salvo:", data);
      return { ...data, completed };
    },
    retry: 2, // Retry automático
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    onSuccess: async (result) => {
      console.log("[LESSON-PROGRESS] ✅ onSuccess - atualizando estado:", { 
        completed: result.completed 
      });
      
      setIsCompleted(result.completed);
      
      // Invalidação hierárquica (específico -> geral)
      console.log("[LESSON-PROGRESS] 🔄 Invalidando caches relacionados");
      await queryClient.invalidateQueries({ 
        queryKey: ["learning-lesson-progress", lessonId],
        refetchType: 'active'
      });
      
      await queryClient.invalidateQueries({ 
        queryKey: ["learning-user-progress"],
        refetchType: 'active'
      });
      
      await queryClient.invalidateQueries({ 
        queryKey: ["learning-completed-lessons"],
        refetchType: 'active'
      });
      
      await queryClient.invalidateQueries({ 
        queryKey: ["course-details"],
        refetchType: 'active'
      });
    },
    onError: (error: any) => {
      console.error("[LESSON-PROGRESS] ❌ Erro ao salvar progresso:", error);
    }
  });

  // Inicialização automática quando acessa a aula pela primeira vez
  useEffect(() => {
    if (lessonId && 
        !userProgress && 
        !isLoadingProgress && 
        !progressInitialized.current &&
        !updateProgressMutation.isPending) {
      
      const timer = setTimeout(() => {
        console.log("[LESSON-PROGRESS] 🎬 Inicializando progresso da aula");
        updateProgressMutation.mutate(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [lessonId, userProgress, isLoadingProgress]);

  // Atualizar progresso (mantém compatibilidade com API antiga)
  const updateProgress = (newProgress: number) => {
    // Sistema binário: >= 95% marca como concluída
    const shouldComplete = newProgress >= 95;
    if (shouldComplete !== isCompleted && progressInitialized.current) {
      updateProgressMutation.mutate(shouldComplete);
    }
  };
  
  // Marcar como concluída com toast e aguardar salvamento
  const completeLesson = async () => {
    const loadingId = showModernLoading(
      "Concluindo aula",
      "Salvando seu progresso..."
    );
    
    try {
      await updateProgressMutation.mutateAsync(true);
      dismissModernToast(loadingId);
      showModernSuccess("Aula concluída!", "Seu progresso foi salvo com sucesso");
      
      console.log("[LESSON-PROGRESS] ✅ Aula concluída com sucesso");
    } catch (error) {
      dismissModernToast(loadingId);
      showModernError(
        "Erro ao concluir aula",
        "Não foi possível salvar. Tente novamente."
      );
      console.error("[LESSON-PROGRESS] ❌ Erro ao concluir aula:", error);
      throw error; // Re-throw para que o componente saiba que falhou
    }
  };

  // Progresso padronizado (0, 5 ou 100)
  const progress = isCompleted ? LESSON_PROGRESS.COMPLETED : (userProgress?.progress_percentage || LESSON_PROGRESS.NOT_STARTED);

  return {
    progress,
    isCompleted,
    userProgress,
    isUpdating: updateProgressMutation.isPending,
    updateProgress,
    completeLesson,
    isLoading: isLoadingProgress
  };
}
