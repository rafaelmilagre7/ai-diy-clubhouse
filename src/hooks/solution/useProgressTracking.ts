
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { Progress } from '@/types/supabaseTypes';

export const useProgressTracking = (solutionId: string | undefined) => {
  const [progress, setProgress] = useState<Progress | null>(null);
  const { user } = useAuth();
  const { log, logError } = useLogging('useProgressTracking');

  // Buscar progresso do usuário
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user || !solutionId) return;

      try {
        const { data: progressData, error } = await supabase
          .from('progress')
          .select('*')
          .eq('solution_id', solutionId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (progressData) {
          log('Progresso encontrado', { progressId: progressData.id });
          setProgress(progressData as Progress);
        } else {
          // Criar um novo registro de progresso se não existir
          const { data: newProgress, error: createError } = await supabase
            .from('progress')
            .insert({
              user_id: user.id,
              solution_id: solutionId,
              current_module: 0,
              is_completed: false,
              completed_modules: [],
              last_activity: new Date().toISOString(),
              last_interaction_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (createError) throw createError;
          
          log('Novo progresso criado', { progressId: newProgress.id });
          setProgress(newProgress as Progress);
        }
      } catch (err) {
        logError('Erro ao buscar progresso:', err);
      }
    };

    fetchProgress();
  }, [solutionId, user, log, logError]);
  
  // Função para atualizar o progresso
  const updateProgress = useCallback(async (updates: Partial<Progress>) => {
    if (!progress?.id || !user) return null;
    
    try {
      // Adicionar timestamp de última interação
      const updatedData = {
        ...updates,
        last_activity: new Date().toISOString(),
        last_interaction_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('progress')
        .update(updatedData)
        .eq('id', progress.id)
        .select()
        .single();
      
      if (error) throw error;
      
      log('Progresso atualizado', { progressId: data.id });
      setProgress(data as Progress);
      return data;
    } catch (err) {
      logError('Erro ao atualizar progresso:', err);
      return null;
    }
  }, [progress, user, log, logError]);

  return { progress, updateProgress };
};
