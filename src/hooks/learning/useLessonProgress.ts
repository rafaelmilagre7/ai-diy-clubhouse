
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
  
  // Mutation para criar/atualizar progresso (SIMPLIFICADO)
  const updateProgressMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      console.log('[MUTATION] 🚀 INICIANDO updateProgressMutation');
      console.log('[MUTATION] 📊 Params:', { lessonId, completed });
      
      if (!lessonId) {
        console.error('[MUTATION] ❌ lessonId ausente');
        throw new Error("ID da lição não fornecido");
      }
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.error('[MUTATION] ❌ Usuário não autenticado');
        throw new Error("Usuário não autenticado");
      }
      
      console.log('[MUTATION] ✅ Usuário:', userData.user.id);
      console.log('[MUTATION] 🔄 Verificando progresso existente...');
      
      const timestamp = new Date().toISOString();
      const progressPercentage = completed ? 100 : 1;
      
      // Verificar se já existe um registro
      const { data: existingProgress } = await supabase
        .from("learning_progress")
        .select("id, started_at")
        .eq("user_id", userData.user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();
      
      console.log('[MUTATION] 📊 Progresso existente:', existingProgress);

      let data, error;

      if (existingProgress) {
        console.log('[MUTATION] 🔄 Executando UPDATE...');
        // UPDATE: Preservar started_at original
        const updateResult = await supabase
          .from("learning_progress")
          .update({
            progress_percentage: progressPercentage,
            updated_at: timestamp,
            completed_at: completed ? timestamp : null,
            last_position_seconds: 0
          })
          .eq("user_id", userData.user.id)
          .eq("lesson_id", lessonId)
          .select()
          .single();
          
        data = updateResult.data;
        error = updateResult.error;
        
        if (error) {
          console.error('[MUTATION] ❌ Erro no UPDATE:', error);
        } else {
          console.log('[MUTATION] ✅ UPDATE concluído com sucesso!', data);
        }
      } else {
        console.log('[MUTATION] 🔄 Executando INSERT...');
        // INSERT: Criar novo registro
        const insertResult = await supabase
          .from("learning_progress")
          .insert({
            user_id: userData.user.id,
            lesson_id: lessonId,
            progress_percentage: progressPercentage,
            started_at: timestamp,
            updated_at: timestamp,
            completed_at: completed ? timestamp : null,
            last_position_seconds: 0
          })
          .select()
          .single();
          
        data = insertResult.data;
        error = insertResult.error;
        
        if (error) {
          console.error('[MUTATION] ❌ Erro no INSERT:', error);
        } else {
          console.log('[MUTATION] ✅ INSERT concluído com sucesso!', data);
        }
      }
        
      if (error) {
        console.error('[MUTATION] ❌ Erro ao salvar:', error);
        throw new Error(`Erro ao salvar progresso: ${error.message}`);
      }

      console.log('[MUTATION] ✅ Progresso salvo com sucesso!');
      
      return { ...data, completed: completed };
    },
    onSuccess: async (result) => {
      console.log('[PROGRESS] ✅ Sucesso:', { completed: result.completed });
      
      setIsCompleted(result.completed);
      
      if (result.completed) {
        toast.success("Aula concluída com sucesso!");
        sessionStorage.setItem('learning_progress_updated', Date.now().toString());
      }
      
      // Invalidar queries relacionadas
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning-completed-lessons"] }),
        queryClient.invalidateQueries({ queryKey: ["learning-lesson-progress"] }),
        queryClient.invalidateQueries({ queryKey: ["learning-user-progress"] }),
        queryClient.invalidateQueries({ queryKey: ["course-details"] })
      ]);
      
      await refetchProgress();
    },
    onError: (error: any) => {
      console.error('[PROGRESS] ❌ Erro:', error);
      toast.error('Não foi possível salvar seu progresso. Tente novamente.');
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
  const completeLesson = async (): Promise<boolean> => {
    console.log('[PROGRESS] 🎯 completeLesson INICIADO');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[PROGRESS] ❌ Usuário não encontrado');
      toast.error('Você precisa estar logado para marcar a aula como concluída');
      return false;
    }
    
    console.log('[PROGRESS] ✅ Usuário:', user.id, 'Lesson:', lessonId);
    
    try {
      console.log('[PROGRESS] 🔄 Chamando mutateAsync(true)...');
      await updateProgressMutation.mutateAsync(true);
      
      console.log('[PROGRESS] ✅ Mutation concluída com sucesso!');
      setIsCompleted(true);
      return true;
    } catch (error) {
      console.error('[PROGRESS] ❌ Erro no mutation:', error);
      toast.error('Erro ao salvar progresso');
      return false;
    }
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
