import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useLogging } from '@/hooks/useLogging';

interface FlowProgress {
  [stepId: string]: {
    completed: boolean;
    completedAt?: string;
  };
}

interface UseFlowProgressProps {
  solutionId: string;
  userId: string;
  initialProgress?: FlowProgress;
}

export const useFlowProgress = ({ 
  solutionId, 
  userId,
  initialProgress = {}
}: UseFlowProgressProps) => {
  const [progress, setProgress] = useState<FlowProgress>(initialProgress);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { log, logError } = useLogging();

  // Carregar progresso do banco ao montar
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_generated_solutions')
          .select('flow_progress')
          .eq('id', solutionId)
          .eq('user_id', userId)
          .single();

        if (error) throw error;

        if (data?.flow_progress) {
          setProgress(data.flow_progress as FlowProgress);
          log('Flow progress loaded', { solutionId, stepCount: Object.keys(data.flow_progress).length });
        }
      } catch (error) {
        logError('Error loading flow progress', error);
      }
    };

    loadProgress();
  }, [solutionId, userId]);

  // Marcar etapa como concluída
  const markStepCompleted = useCallback(async (stepId: string) => {
    const updatedProgress = {
      ...progress,
      [stepId]: {
        completed: true,
        completedAt: new Date().toISOString()
      }
    };

    setProgress(updatedProgress);
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('ai_generated_solutions')
        .update({ 
          flow_progress: updatedProgress,
          updated_at: new Date().toISOString()
        })
        .eq('id', solutionId)
        .eq('user_id', userId);

      if (error) throw error;

      log('Flow step completed', { solutionId, stepId });
      
      toast({
        title: 'Etapa concluída! ✓',
        description: 'Seu progresso foi salvo.',
      });
    } catch (error) {
      logError('Error saving flow progress', error);
      // Reverter mudança local em caso de erro
      setProgress(progress);
      
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o progresso.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [progress, solutionId, userId]);

  // Desmarcar etapa
  const markStepIncomplete = useCallback(async (stepId: string) => {
    const updatedProgress = { ...progress };
    delete updatedProgress[stepId];

    setProgress(updatedProgress);
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('ai_generated_solutions')
        .update({ 
          flow_progress: updatedProgress,
          updated_at: new Date().toISOString()
        })
        .eq('id', solutionId)
        .eq('user_id', userId);

      if (error) throw error;

      log('Flow step marked incomplete', { solutionId, stepId });
    } catch (error) {
      logError('Error updating flow progress', error);
      setProgress(progress);
    } finally {
      setIsSaving(false);
    }
  }, [progress, solutionId, userId]);

  // Verificar se etapa está concluída
  const isStepCompleted = useCallback((stepId: string) => {
    return progress[stepId]?.completed || false;
  }, [progress]);

  // Calcular estatísticas
  const getStats = useCallback((totalSteps: number) => {
    const completedCount = Object.values(progress).filter(p => p.completed).length;
    const percentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

    return {
      completed: completedCount,
      total: totalSteps,
      percentage
    };
  }, [progress]);

  return {
    progress,
    isSaving,
    markStepCompleted,
    markStepIncomplete,
    isStepCompleted,
    getStats
  };
};
