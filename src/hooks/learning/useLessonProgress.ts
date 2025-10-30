
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
  const mutationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      
      const timestamp = new Date().toISOString();
      const progressPercentage = completed ? 100 : 1;

      // ✅ Usar RPC SECURITY DEFINER (bypassa RLS) - SEM SELECT ANTES
      console.log('[MUTATION] 🔄 Chamando safe_upsert_learning_progress...');
      
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'safe_upsert_learning_progress',
        {
          p_lesson_id: lessonId,
          p_progress_percentage: progressPercentage,
          p_completed_at: completed ? timestamp : null
        }
      );
      
      if (rpcError) {
        console.error('[MUTATION] ❌ Erro no RPC:', rpcError);
        throw new Error(`Erro ao salvar: ${rpcError.message}`);
      }
      
      console.log('[MUTATION] ✅ RPC executado com sucesso!', rpcData);
      console.log('[MUTATION] 🔍 Operação realizada:', rpcData?.operation || 'UNKNOWN');
      
      // ✅ USAR DADOS DO RPC (sem SELECT adicional)
      if (!rpcData) {
        console.warn('[MUTATION] ⚠️ RPC não retornou dados');
        return { progress_percentage: progressPercentage, completed };
      }
        
      return { 
        ...rpcData,
        completed 
      };
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
      
      // ✅ RESET EXPLÍCITO: Forçar reset da mutation após erro
      setTimeout(() => {
        updateProgressMutation.reset();
      }, 100);
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
      
      console.log('[INIT] 🔄 Inicializando progresso via RPC...');
      
      // ✅ Usar RPC diretamente (sem SELECT antes) - ele faz UPSERT
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'safe_upsert_learning_progress',
        {
          p_lesson_id: lessonId,
          p_progress_percentage: 1,
          p_completed_at: null
        }
      );
      
      if (rpcError) {
        console.error('[INIT] ❌ Erro no RPC:', rpcError);
        throw rpcError;
      }
      
      console.log('[INIT] ✅ RPC sucesso!', rpcData);
      console.log('[INIT] 🔍 Operação realizada:', rpcData?.operation || 'UNKNOWN');
      
      // ✅ USAR DADOS DO RPC (sem SELECT adicional)
      if (rpcData) {
        setIsCompleted(rpcData.progress_percentage >= 100);
      }
      
      return rpcData;
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
  
  // Marcar lição como concluída (REFATORADO - usa nova RPC)
  const completeLesson = async (): Promise<boolean> => {
    console.log('[COMPLETE-V2] 🎯 INÍCIO - lessonId:', lessonId);
    
    // Verificar se já está completada
    if (isCompleted) {
      console.log('[COMPLETE-V2] ⚠️ Já está completada, retornando true');
      return true;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[COMPLETE-V2] ❌ Usuário não encontrado');
      toast.error('Você precisa estar logado para marcar a aula como concluída');
      return false;
    }
    
    if (!lessonId) {
      console.error('[COMPLETE-V2] ❌ lessonId não encontrado');
      toast.error('Erro: ID da aula não encontrado');
      return false;
    }
    
    console.log('[COMPLETE-V2] ✅ Validações OK - User:', user.id, 'Lesson:', lessonId);
    
    try {
      console.log('[COMPLETE-V2] 🔄 Chamando complete_lesson_v2...');
      
      // ✅ Usar nova RPC simplificada e atômica
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'complete_lesson_v2',
        {
          p_lesson_id: lessonId,
          p_progress_percentage: 100,
          p_completed_at: new Date().toISOString()
        }
      );
      
      if (rpcError) {
        console.error('[COMPLETE-V2] ❌ Erro na RPC:', rpcError);
        toast.error('Erro ao salvar progresso');
        return false;
      }
      
      console.log('[COMPLETE-V2] ✅ RPC bem-sucedido!', rpcData);
      
      // Atualizar estado local
      setIsCompleted(true);
      toast.success('Aula marcada como concluída!');
      
      // Invalidar caches relevantes
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning-completed-lessons"] }),
        queryClient.invalidateQueries({ queryKey: ["learning-lesson-progress"] }),
        queryClient.invalidateQueries({ queryKey: ["learning-user-progress"] }),
        queryClient.invalidateQueries({ queryKey: ["learning-course-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["course-details"] })
      ]);
      
      // Refetch para atualizar a UI
      await refetchProgress();
      
      // Sinalizar update no sessionStorage para sync entre tabs
      sessionStorage.setItem('learning_progress_updated', Date.now().toString());
      
      return true;
      
    } catch (error) {
      console.error('[COMPLETE-V2] ❌ Erro inesperado:', error);
      toast.error('Erro ao salvar progresso');
      return false;
    }
  };

  // Timeout de segurança para isUpdating travado
  useEffect(() => {
    // Se isUpdating ficar travado por mais de 10s, resetar forçadamente
    if (updateProgressMutation.isPending || initializeProgressMutation.isPending) {
      mutationTimeoutRef.current = setTimeout(() => {
        console.warn('[PROGRESS] ⚠️ Timeout detectado! Resetando mutations...');
        updateProgressMutation.reset();
        initializeProgressMutation.reset();
        toast.error('A operação demorou muito. Por favor, tente novamente.');
      }, 10000); // 10 segundos
    } else {
      // Limpar timeout se a mutation concluir normalmente
      if (mutationTimeoutRef.current) {
        clearTimeout(mutationTimeoutRef.current);
        mutationTimeoutRef.current = null;
      }
    }
    
    return () => {
      if (mutationTimeoutRef.current) {
        clearTimeout(mutationTimeoutRef.current);
      }
    };
  }, [updateProgressMutation.isPending, initializeProgressMutation.isPending]);

  // Função para resetar mutations manualmente
  const resetMutations = () => {
    console.log('[PROGRESS] 🔄 Reset manual acionado');
    updateProgressMutation.reset();
    initializeProgressMutation.reset();
    if (mutationTimeoutRef.current) {
      clearTimeout(mutationTimeoutRef.current);
      mutationTimeoutRef.current = null;
    }
    toast.info('Estado resetado. Tente novamente.');
  };

  // Progresso para compatibilidade (retorna 0 ou 100)
  const progress = isCompleted ? 100 : (userProgress ? 1 : 0);

  return {
    progress,
    isCompleted,
    userProgress,
    isUpdating: updateProgressMutation.isPending || initializeProgressMutation.isPending,
    updateProgress,
    completeLesson,
    resetMutations
  };
}
