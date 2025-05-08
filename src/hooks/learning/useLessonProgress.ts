
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UseLessonProgressProps {
  lessonId?: string;
}

export function useLessonProgress({ lessonId }: UseLessonProgressProps) {
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  // Buscar progresso atual da lição
  const { 
    data: userProgress,
    refetch: refetchProgress
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
        
      if (error) {
        console.error("Erro ao carregar progresso da lição:", error);
        return null;
      }
      
      if (data) {
        setProgress(data.progress_percentage);
      }
      
      return data;
    },
    enabled: !!lessonId
  });
  
  // Salvar progresso da lição
  const updateProgressMutation = useMutation({
    mutationFn: async (newProgress: number) => {
      if (!lessonId) throw new Error("ID da lição não fornecido");
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const timestamp = new Date().toISOString();
      
      if (userProgress) {
        // Atualizar progresso existente
        const { error } = await supabase
          .from("learning_progress")
          .update({ 
            progress_percentage: newProgress,
            last_position_seconds: 0,
            updated_at: timestamp,
            completed_at: newProgress >= 100 ? timestamp : userProgress.completed_at
          })
          .eq("id", userProgress.id);
          
        if (error) throw error;
      } else {
        // Criar novo registro de progresso
        const { error } = await supabase
          .from("learning_progress")
          .insert({
            user_id: userData.user.id,
            lesson_id: lessonId,
            progress_percentage: newProgress,
            started_at: timestamp,
            completed_at: newProgress >= 100 ? timestamp : null
          });
          
        if (error) throw error;
      }
      
      return newProgress;
    },
    onSuccess: (newProgress) => {
      setProgress(newProgress);
      refetchProgress();
      if (newProgress >= 100) {
        toast.success("Lição concluída com sucesso!");
      }
      queryClient.invalidateQueries({ queryKey: ["learning-completed-lessons"] });
    },
    onError: (error) => {
      console.error("Erro ao salvar progresso:", error);
      toast.error("Não foi possível salvar seu progresso");
    }
  });

  // Marcar lição como iniciada quando a página carrega
  useEffect(() => {
    if (lessonId && !userProgress && updateProgressMutation.isIdle) {
      updateProgressMutation.mutate(1);
    }
  }, [lessonId, userProgress, updateProgressMutation]);

  // Atualizar progresso quando o usuário interage com a lição
  const updateProgress = (newProgress: number) => {
    // Se o progresso for maior que o atual, atualizamos
    if (newProgress > progress) {
      updateProgressMutation.mutate(newProgress);
    }
  };
  
  // Marcar lição como concluída
  const completeLesson = async () => {
    await updateProgressMutation.mutateAsync(100);
  };

  return {
    progress,
    userProgress,
    isUpdating: updateProgressMutation.isPending,
    updateProgress,
    completeLesson
  };
}
