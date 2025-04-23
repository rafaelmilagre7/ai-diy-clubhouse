
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Progress } from '@/types/supabaseTypes';
import { useLogging } from '@/hooks/useLogging';

export const useProgressTracking = (solutionId: string | undefined) => {
  const { user } = useAuth();
  const { log, logError } = useLogging('useProgressTracking');

  // Buscar o progresso atual usando react-query
  const { 
    data: progress, 
    isLoading: loading 
  } = useQuery({
    queryKey: ['solutionProgress', solutionId, user?.id],
    queryFn: async () => {
      if (!user || !solutionId) return null;
      
      try {
        const { data, error } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('solution_id', solutionId)
          .maybeSingle();
          
        if (error) {
          logError("Erro ao buscar progresso", { error });
          return null;
        }
        
        if (data) {
          // Calcular porcentagem de conclusão se houver módulos concluídos
          if (data.completed_modules && Array.isArray(data.completed_modules)) {
            const totalModules = await getTotalModulesCount(solutionId);
            const completedCount = data.completed_modules.length;
            const percentage = totalModules ? Math.round((completedCount / totalModules) * 100) : 0;
            
            return {
              ...data,
              completion_percentage: percentage
            } as Progress;
          }
          return data as Progress;
        }
        
        return null;
      } catch (err) {
        logError("Erro ao processar progresso", { err });
        return null;
      }
    },
    enabled: !!user && !!solutionId,
    staleTime: 2 * 60 * 1000 // 2 minutos de cache
  });
  
  // Função para obter a contagem de módulos de uma solução
  const getTotalModulesCount = async (solutionId: string): Promise<number> => {
    try {
      const { count } = await supabase
        .from('modules')
        .select('id', { count: 'exact', head: true })
        .eq('solution_id', solutionId);
        
      return count || 0;
    } catch (err) {
      logError("Erro ao contar módulos", { err });
      return 0;
    }
  };
  
  // Mutation para atualizar o progresso
  const updateProgressMutation = useMutation({
    mutationFn: async (updates: Partial<Progress>) => {
      if (!user || !solutionId || !progress?.id) {
        throw new Error('Dados insuficientes para atualizar o progresso');
      }
      
      const { error } = await supabase
        .from('progress')
        .update({
          ...updates,
          last_activity: new Date().toISOString()
        })
        .eq('id', progress.id);
        
      if (error) {
        throw error;
      }
      
      return { ...progress, ...updates };
    },
    onSuccess: (updatedProgress) => {
      // Atualizar o cache
      queryClient.setQueryData(
        ['solutionProgress', solutionId, user?.id], 
        updatedProgress
      );
    },
    onError: (error) => {
      logError("Erro ao atualizar progresso", { error });
    }
  });
  
  // Função para atualizar o progresso
  const updateProgress = async (updates: Partial<Progress>): Promise<void> => {
    try {
      await updateProgressMutation.mutateAsync(updates);
    } catch (err) {
      logError("Erro ao processar atualização de progresso", { err });
    }
  };

  return {
    progress,
    updateProgress,
    loading
  };
};
