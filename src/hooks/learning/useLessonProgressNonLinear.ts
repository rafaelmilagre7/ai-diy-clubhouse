
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UseLessonProgressProps {
  lessonId?: string;
  autoInitialize?: boolean;
}

interface ProgressData {
  id: string;
  progress_percentage: number;
  video_progress: Record<string, number>;
  completed_at: string | null;
  started_at: string;
  last_position_seconds: number;
  notes: string | null;
}

export function useLessonProgressNonLinear({ 
  lessonId, 
  autoInitialize = false 
}: UseLessonProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const queryClient = useQueryClient();

  // Buscar progresso atual da lição com melhor tratamento de erro
  const { 
    data: userProgress,
    isLoading,
    error,
    refetch: refetchProgress
  } = useQuery({
    queryKey: ["lesson-progress-nonlinear", lessonId],
    queryFn: async (): Promise<ProgressData | null> => {
      if (!lessonId) {
        console.log("Lesson ID não fornecido");
        return null;
      }
      
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          console.log("Usuário não autenticado:", userError?.message);
          return null;
        }
        
        const { data, error: progressError } = await supabase
          .from("learning_progress")
          .select("*")
          .eq("user_id", userData.user.id)
          .eq("lesson_id", lessonId)
          .maybeSingle();
          
        if (progressError) {
          console.error("Erro ao carregar progresso:", progressError);
          // Não lançar erro, apenas retornar null para permitir criação posterior
          return null;
        }
        
        if (data) {
          setProgress(data.progress_percentage || 0);
          return data;
        }
        
        return null;
      } catch (err) {
        console.error("Erro inesperado ao buscar progresso:", err);
        return null;
      }
    },
    enabled: !!lessonId,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  // Mutation para criar/atualizar progresso
  const updateProgressMutation = useMutation({
    mutationFn: async ({ 
      newProgress, 
      videoProgress = {},
      notes = null 
    }: { 
      newProgress: number; 
      videoProgress?: Record<string, number>;
      notes?: string | null;
    }) => {
      if (!lessonId) {
        throw new Error("ID da lição não fornecido");
      }
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("Usuário não autenticado");
      }
      
      const timestamp = new Date().toISOString();
      
      if (userProgress?.id) {
        // Atualizar progresso existente
        const { data, error } = await supabase
          .from("learning_progress")
          .update({ 
            progress_percentage: newProgress,
            video_progress: videoProgress,
            last_position_seconds: 0,
            updated_at: timestamp,
            completed_at: newProgress >= 100 ? timestamp : userProgress.completed_at,
            notes: notes
          })
          .eq("id", userProgress.id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } else {
        // Criar novo registro de progresso
        const { data, error } = await supabase
          .from("learning_progress")
          .insert({
            user_id: userData.user.id,
            lesson_id: lessonId,
            progress_percentage: newProgress,
            video_progress: videoProgress,
            started_at: timestamp,
            completed_at: newProgress >= 100 ? timestamp : null,
            notes: notes
          })
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data, variables) => {
      setProgress(variables.newProgress);
      queryClient.setQueryData(["lesson-progress-nonlinear", lessonId], data);
      
      if (variables.newProgress >= 100) {
        toast.success("Lição concluída com sucesso!");
      }
      
      // Invalidar consultas relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ["learning-completed-lessons"] 
      });
    },
    onError: (error) => {
      console.error("Erro ao salvar progresso:", error);
      toast.error("Não foi possível salvar seu progresso. Tentando novamente...");
      
      // Retry após 2 segundos
      setTimeout(() => {
        updateProgressMutation.retry();
      }, 2000);
    }
  });

  // Inicializar progresso se necessário
  const initializeProgress = useCallback(async () => {
    if (!lessonId || userProgress || isInitializing) return;
    
    setIsInitializing(true);
    try {
      await updateProgressMutation.mutateAsync({ newProgress: 1 });
    } catch (error) {
      console.error("Erro ao inicializar progresso:", error);
    } finally {
      setIsInitializing(false);
    }
  }, [lessonId, userProgress, isInitializing, updateProgressMutation]);

  // Auto-inicializar se habilitado
  useState(() => {
    if (autoInitialize && !isLoading && !userProgress && !error) {
      initializeProgress();
    }
  });

  // Atualizar progresso
  const updateProgress = useCallback((newProgress: number, videoProgress?: Record<string, number>) => {
    if (newProgress > progress) {
      updateProgressMutation.mutate({ 
        newProgress, 
        videoProgress: videoProgress || {} 
      });
    }
  }, [progress, updateProgressMutation]);
  
  // Marcar lição como concluída
  const completeLesson = useCallback(async (notes?: string) => {
    try {
      await updateProgressMutation.mutateAsync({ 
        newProgress: 100, 
        notes 
      });
      return true;
    } catch (error) {
      console.error("Erro ao completar lição:", error);
      return false;
    }
  }, [updateProgressMutation]);

  // Verificar se pode acessar a lição (sempre true para não-linear)
  const canAccessLesson = true;

  return {
    progress,
    userProgress,
    isLoading: isLoading || isInitializing,
    isUpdating: updateProgressMutation.isPending,
    error,
    canAccessLesson,
    updateProgress,
    completeLesson,
    initializeProgress,
    refetchProgress
  };
}
