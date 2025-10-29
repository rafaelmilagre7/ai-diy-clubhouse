
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
      
      // Verificar autenticação ANTES de tentar salvar
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('[PROGRESS-MUTATION] 🔐 Verificação de sessão:', {
        hasSession: !!session,
        sessionError: sessionError?.message,
        accessToken: session?.access_token ? 'presente' : 'ausente',
        userId: session?.user?.id,
        expiresAt: session?.expires_at
      });
      
      if (sessionError || !session) {
        console.error('[PROGRESS-MUTATION] ❌ Sessão inválida:', sessionError);
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      console.log('[PROGRESS-MUTATION] 📝 Tentando salvar progresso:', {
        userId: userData.user.id,
        email: userData.user.email,
        lessonId,
        completed,
        hasSession: !!session
      });
      
      const timestamp = new Date().toISOString();
      const progressPercentage = completed ? 100 : 1;
      
      // Verificar se já existe um registro
      const { data: existingProgress } = await supabase
        .from("learning_progress")
        .select("id, started_at")
        .eq("user_id", userData.user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      let data, error;

      if (existingProgress) {
        // UPDATE: Preservar started_at original
        console.log('[PROGRESS-MUTATION] 📝 Atualizando progresso existente...');
        
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
      } else {
        // INSERT: Criar novo registro
        console.log('[PROGRESS-MUTATION] 📝 Criando novo progresso...');
        
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
      }
        
      if (error) {
        console.error('[PROGRESS-MUTATION] ❌ ERRO DETALHADO:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          errorObject: JSON.stringify(error)
        });
        
        // Verificar tipo específico de erro
        if (error.code === '42501') {
          throw new Error('Erro de permissão RLS: ' + error.message);
        } else if (error.code === '23505') {
          throw new Error('Conflito de chave duplicada: ' + error.message);
        } else if (error.message.includes('policy')) {
          throw new Error('Erro de política de segurança: ' + error.message);
        } else {
          throw new Error('Erro ao salvar progresso: ' + error.message);
        }
      }

      console.log('[PROGRESS-MUTATION] ✅ Operação bem-sucedida:', data);

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
    onSuccess: async (result) => {
      console.log('[PROGRESS-LEGACY] ✅ Progresso salvo com sucesso:', { completed: result.completed, lessonId });
      
      setIsCompleted(result.completed);
      
      if (result.completed) {
        toast.success("Aula concluída com sucesso!");
        
        // Sinalizar para outras páginas que houve atualização
        sessionStorage.setItem('learning_progress_updated', Date.now().toString());
      }
      
      // Invalidar TODAS as queries relacionadas
      console.log('[PROGRESS-LEGACY] 🔄 Invalidando todas as queries relacionadas');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning-completed-lessons"] }),
        queryClient.invalidateQueries({ queryKey: ["learning-lesson-progress"] }),
        queryClient.invalidateQueries({ queryKey: ["learning-user-progress"] }),
        queryClient.invalidateQueries({ queryKey: ["course-details"] }),
        queryClient.invalidateQueries({ queryKey: ["learning-courses"] })
      ]);
      
      // Forçar refetch imediato e após delay
      await refetchProgress();
      
      setTimeout(async () => {
        console.log('[PROGRESS-LEGACY] 🔄 Refresh automático com refetch forçado');
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ["learning-lesson-progress", lessonId] }),
          queryClient.refetchQueries({ queryKey: ["course-details"] }),
          queryClient.refetchQueries({ queryKey: ["learning-user-progress"] })
        ]);
      }, 300);
    },
    onError: (error: any) => {
      console.error('[PROGRESS-MUTATION] ❌ Erro ao salvar progresso:', error);
      
      // Mostrar mensagem específica baseada no erro
      if (error.message.includes('Sessão expirada')) {
        toast.error('Sua sessão expirou. Por favor, faça login novamente.');
      } else if (error.message.includes('permissão')) {
        toast.error('Você não tem permissão para atualizar este progresso');
      } else if (error.code !== '23505') {
        toast.error('Não foi possível salvar seu progresso. Tente novamente.');
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
  const completeLesson = async (): Promise<boolean> => {
    console.log('[USE-LESSON-PROGRESS] 🎯 completeLesson() chamado');
    
    // Verificar autenticação ANTES de tentar salvar
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[USE-LESSON-PROGRESS] ❌ Usuário não autenticado:', authError);
      toast.error('Você precisa estar logado para marcar a aula como concluída');
      return false;
    }
    
    console.log('[USE-LESSON-PROGRESS] ✅ Usuário autenticado:', { 
      userId: user.id, 
      email: user.email 
    });
    
    console.log('[USE-LESSON-PROGRESS] Estado atual:', { isCompleted, lessonId });
    
    try {
      await updateProgressMutation.mutateAsync(true);
      
      // Atualizar estado local IMEDIATAMENTE após salvar
      setIsCompleted(true);
      
      console.log('[USE-LESSON-PROGRESS] ✅ Aula marcada como concluída com sucesso');
      return true;
    } catch (error) {
      console.error('[USE-LESSON-PROGRESS] ❌ Erro ao marcar como concluída:', error);
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
