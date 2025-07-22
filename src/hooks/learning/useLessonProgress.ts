
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UseLessonProgressProps {
  lessonId?: string;
}

export function useLessonProgress({ lessonId }: UseLessonProgressProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const queryClient = useQueryClient();
  const isCreatingInitialProgress = useRef(false);

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
        console.error("Erro ao carregar progresso da lição:", error);
        return null;
      }
      
      if (data) {
        // Progresso binário: considera concluída se >= 100%
        setIsCompleted(data.progress_percentage >= 100);
      }
      
      return data;
    },
    enabled: !!lessonId
  });
  
  // Mutation para criar/atualizar progresso (usando UPSERT)
  const updateProgressMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      if (!lessonId) throw new Error("ID da lição não fornecido");
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const timestamp = new Date().toISOString();
      const progressPercentage = completed ? 100 : 1; // 1% para iniciada, 100% para concluída
      
      // Usar UPSERT para evitar conflitos de chave duplicada
      const { data, error } = await supabase
        .from("learning_progress")
        .upsert({
          user_id: userData.user.id,
          lesson_id: lessonId,
          progress_percentage: progressPercentage,
          started_at: timestamp,
          updated_at: timestamp,
          completed_at: completed ? timestamp : null,
          last_position_seconds: 0
        }, {
          onConflict: 'user_id,lesson_id',
          ignoreDuplicates: false
        })
        .select()
        .single();
        
      if (error) {
        // Se ainda houver erro de duplicata, tentar UPDATE específico
        if (error.code === '23505') {
          const { error: updateError } = await supabase
            .from("learning_progress")
            .update({ 
              progress_percentage: progressPercentage,
              updated_at: timestamp,
              completed_at: completed ? timestamp : userProgress?.completed_at
            })
            .eq("user_id", userData.user.id)
            .eq("lesson_id", lessonId);
            
          if (updateError) throw updateError;

          // Log da atualização de progresso
          await supabase.rpc('log_learning_action', {
            p_action: completed ? 'lesson_completed' : 'lesson_progress_updated',
            p_resource_type: 'lesson',
            p_resource_id: lessonId,
            p_details: {
              progress_percentage: progressPercentage,
              completed: completed,
              method: 'update'
            }
          });

          return { progress_percentage: progressPercentage, completed: completed };
        }
        throw error;
      }

      // Log da criação/atualização de progresso
      await supabase.rpc('log_learning_action', {
        p_action: completed ? 'lesson_completed' : 'lesson_progress_updated',
        p_resource_type: 'lesson',
        p_resource_id: lessonId,
        p_details: {
          progress_percentage: progressPercentage,
          completed: completed,
          method: 'upsert'
        }
      });
      
      return { ...data, completed: completed };
    },
    onSuccess: (result) => {
      setIsCompleted(result.completed);
      refetchProgress();
      
      if (result.completed) {
        toast.success("Aula concluída com sucesso!");
      }
      
      queryClient.invalidateQueries({ queryKey: ["learning-completed-lessons"] });
    },
    onError: (error: any) => {
      console.error("Erro ao salvar progresso:", error);
      
      // Não mostrar toast para erros de duplicata - são esperados
      if (error.code !== '23505') {
        toast.error("Não foi possível salvar seu progresso");
      }
    }
  });

  // Mutation específica para inicializar progresso
  const initializeProgressMutation = useMutation({
    mutationFn: async () => {
      if (!lessonId || isCreatingInitialProgress.current) {
        return null;
      }
      
      isCreatingInitialProgress.current = true;
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const timestamp = new Date().toISOString();
      
      // Verificar se já existe progresso antes de tentar criar
      const { data: existingProgress } = await supabase
        .from("learning_progress")
        .select("id, progress_percentage")
        .eq("user_id", userData.user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();
        
      if (existingProgress) {
        setIsCompleted(existingProgress.progress_percentage >= 100);
        return existingProgress;
      }
      
      // Tentar inserir novo registro com 1% (iniciada)
      const { data, error } = await supabase
        .from("learning_progress")
        .insert({
          user_id: userData.user.id,
          lesson_id: lessonId,
          progress_percentage: 1,
          started_at: timestamp,
          updated_at: timestamp
        })
        .select()
        .single();
        
      if (error && error.code === '23505') {
        // Se houve erro de duplicata, buscar o registro existente
        const { data: existingData } = await supabase
          .from("learning_progress")
          .select("*")
          .eq("user_id", userData.user.id)
          .eq("lesson_id", lessonId)
          .single();
          
        if (existingData) {
          setIsCompleted(existingData.progress_percentage >= 100);
        }
        return existingData;
      }
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        setIsCompleted(data.progress_percentage >= 100);
        refetchProgress();
      }
    },
    onError: (error: any) => {
      console.error("Erro ao inicializar progresso:", error);
    },
    onSettled: () => {
      isCreatingInitialProgress.current = false;
    }
  });

  // Marcar lição como iniciada quando a página carrega
  useEffect(() => {
    if (lessonId && 
        !userProgress && 
        !isLoadingProgress && 
        !isCreatingInitialProgress.current &&
        initializeProgressMutation.isIdle) {
      
      // Pequeno delay para evitar múltiplas execuções
      const timer = setTimeout(() => {
        initializeProgressMutation.mutate();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [lessonId, userProgress, isLoadingProgress, initializeProgressMutation]);

  // Atualizar progresso quando o usuário interage com a lição
  const updateProgress = (newProgress: number) => {
    // Converter para sistema binário
    const shouldComplete = newProgress >= 95;
    if (shouldComplete !== isCompleted) {
      updateProgressMutation.mutate(shouldComplete);
    }
  };
  
  // Marcar lição como concluída
  const completeLesson = async () => {
    await updateProgressMutation.mutateAsync(true);
  };

  // Progresso para compatibilidade (retorna 0 ou 100)
  const progress = isCompleted ? 100 : (userProgress ? 1 : 0);

  return {
    progress,
    isCompleted,
    userProgress,
    isUpdating: updateProgressMutation.isPending || initializeProgressMutation.isPending,
    updateProgress,
    completeLesson
  };
}
