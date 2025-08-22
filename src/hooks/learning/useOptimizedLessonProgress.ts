
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UseOptimizedLessonProgressProps {
  lessonId?: string;
}

export function useOptimizedLessonProgress({ lessonId }: UseOptimizedLessonProgressProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const queryClient = useQueryClient();
  const progressInitialized = useRef(false);

  // Buscar progresso atual da lição com cache otimizado
  const { 
    data: userProgress,
    refetch: refetchProgress,
    isLoading: isLoadingProgress
  } = useQuery({
    queryKey: ["optimized-lesson-progress", lessonId],
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
        console.error("Erro ao carregar progresso otimizado:", error);
        return null;
      }
      
      if (data) {
        // Sistema binário padronizado: >= 100% = concluído
        const completed = data.progress_percentage >= 100;
        setIsCompleted(completed);
        progressInitialized.current = true;
      }
      
      return data;
    },
    enabled: !!lessonId,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000 // 5 minutos
  });
  
  // Mutation otimizada com UPSERT
  const updateProgressMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      if (!lessonId) throw new Error("ID da lição não fornecido");
      
      console.log('[OPTIMIZED-PROGRESS] 🎯 Iniciando atualização de progresso:', {
        lessonId,
        completed,
        timestamp: new Date().toISOString()
      });
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const timestamp = new Date().toISOString();
      const progressPercentage = completed ? 100 : 5; // 5% para iniciada, 100% para concluída
      
      console.log('[OPTIMIZED-PROGRESS] 📝 Preparando UPSERT:', {
        userId: userData.user.id,
        lessonId,
        progressPercentage,
        completed
      });
      
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
        console.error('[OPTIMIZED-PROGRESS] ❌ Erro no UPSERT:', error);
        
        // Fallback para UPDATE se UPSERT falhar
        if (error.code === '23505') {
          console.log('[OPTIMIZED-PROGRESS] 🔄 Tentando UPDATE como fallback');
          
          const { error: updateError } = await supabase
            .from("learning_progress")
            .update({ 
              progress_percentage: progressPercentage,
              updated_at: timestamp,
              completed_at: completed ? timestamp : userProgress?.completed_at
            })
            .eq("user_id", userData.user.id)
            .eq("lesson_id", lessonId);
            
          if (updateError) {
            console.error('[OPTIMIZED-PROGRESS] ❌ Erro no UPDATE:', updateError);
            throw updateError;
          }
          
          console.log('[OPTIMIZED-PROGRESS] ✅ UPDATE bem-sucedido');
          return { progress_percentage: progressPercentage, completed };
        }
        throw error;
      }
      
      console.log('[OPTIMIZED-PROGRESS] ✅ UPSERT bem-sucedido:', data);
      return { ...data, completed };
    },
    onSuccess: (result) => {
      console.log('[OPTIMIZED-PROGRESS] 🎯 onSuccess - invalidando caches:', { completed: result.completed });
      
      setIsCompleted(result.completed);
      
      // Invalidar TODAS as queries relacionadas
      console.log('[OPTIMIZED-PROGRESS] 🔄 Invalidando queries relacionadas');
      queryClient.invalidateQueries({ 
        queryKey: ["optimized-lesson-progress"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["learning-lesson-progress"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["learning-completed-lessons"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["learning-user-progress"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["course-details"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["learning-courses"] 
      });
      
      if (result.completed) {
        toast.success("Aula concluída! ✅");
      }
      
      // Forçar refresh após delay
      setTimeout(() => {
        console.log('[OPTIMIZED-PROGRESS] 🔄 Refresh automático das queries');
        queryClient.refetchQueries({ queryKey: ["optimized-lesson-progress", lessonId] });
        queryClient.refetchQueries({ queryKey: ["course-details"] });
      }, 500);
    },
    onError: (error: any) => {
      console.error('[OPTIMIZED-PROGRESS] ❌ Erro ao salvar progresso:', error);
      
      // Não mostrar toast para erros esperados
      if (error.code !== '23505') {
        toast.error("Não foi possível salvar o progresso");
      }
    }
  });

  // Inicialização automática otimizada
  useEffect(() => {
    if (lessonId && 
        !userProgress && 
        !isLoadingProgress && 
        !progressInitialized.current &&
        updateProgressMutation.isIdle) {
      
      const timer = setTimeout(() => {
        updateProgressMutation.mutate(false); // Iniciar como não concluída
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [lessonId, userProgress, isLoadingProgress, updateProgressMutation]);

  // Função de atualização padronizada
  const updateProgress = (newProgress: number) => {
    // Sistema binário: >= 95% marca como concluída
    const shouldComplete = newProgress >= 95;
    if (shouldComplete !== isCompleted && progressInitialized.current) {
      updateProgressMutation.mutate(shouldComplete);
    }
  };
  
  // Marcar como concluída
  const completeLesson = async () => {
    await updateProgressMutation.mutateAsync(true);
  };

  // Progresso padronizado (0, 5 ou 100)
  const progress = isCompleted ? 100 : (userProgress?.progress_percentage || 0);

  return {
    progress,
    isCompleted,
    userProgress,
    isUpdating: updateProgressMutation.isPending,
    updateProgress,
    completeLesson,
    // Compatibilidade com sistema atual
    isLoading: isLoadingProgress
  };
}
