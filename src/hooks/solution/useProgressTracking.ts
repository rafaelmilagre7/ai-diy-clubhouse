
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Progress } from '@/types/supabaseTypes';
import { useLogging } from '@/hooks/useLogging';

export const useProgressTracking = (solutionId: string | undefined) => {
  const [progress, setProgress] = useState<Progress | null>(null);
  const { user } = useAuth();
  const { log, logError } = useLogging('useProgressTracking');

  // Buscar progresso atual
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user || !solutionId) return;
      
      try {
        const { data, error } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('solution_id', solutionId)
          .maybeSingle();
          
        if (error) {
          logError("Erro ao buscar progresso", { error });
          return;
        }
        
        if (data) {
          // Calcular porcentagem de conclusão se houver módulos concluídos
          if (data.completed_modules && Array.isArray(data.completed_modules)) {
            const totalModules = await getTotalModulesCount(solutionId);
            const completedCount = data.completed_modules.length;
            const percentage = totalModules ? Math.round((completedCount / totalModules) * 100) : 0;
            
            setProgress({
              ...data,
              completion_percentage: percentage
            } as Progress);
          } else {
            setProgress(data as Progress);
          }
        }
      } catch (err) {
        logError("Erro ao processar progresso", { err });
      }
    };
    
    fetchProgress();
  }, [user, solutionId, log, logError]);
  
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
  
  // Função para atualizar o progresso
  const updateProgress = useCallback(async (updates: Partial<Progress>): Promise<void> => {
    if (!user || !solutionId || !progress?.id) return;
    
    try {
      const { error } = await supabase
        .from('progress')
        .update({
          ...updates,
          last_activity: new Date().toISOString()
        })
        .eq('id', progress.id);
        
      if (error) {
        logError("Erro ao atualizar progresso", { error });
        return;
      }
      
      // Atualizar estado local
      setProgress(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      logError("Erro ao processar atualização de progresso", { err });
    }
  }, [user, solutionId, progress?.id, logError]);

  return {
    progress,
    updateProgress
  };
};
