
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { Progress, Solution } from '@/types/solution';

export const useSolutionInteractions = (solutionId: string, solution: Solution | null) => {
  const navigate = useNavigate();
  const { log } = useLogging('SolutionInteractions');
  const [initializing, setInitializing] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);

  // Fetch progress on mount
  useEffect(() => {
    const fetchProgress = async () => {
      if (!solutionId) return;
      
      try {
        const { data, error } = await supabase
          .from('progress')
          .select('*')
          .eq('solution_id', solutionId)
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .maybeSingle();
          
        if (error) throw error;
        setProgress(data);
      } catch (err) {
        console.error('Erro ao buscar progresso:', err);
      }
    };
    
    fetchProgress();
  }, [solutionId]);
  
  // Iniciar implementação de uma solução
  const startImplementation = useCallback(async () => {
    if (!solutionId || !solution) return;
    
    setInitializing(true);
    
    try {
      // Criar registro de progresso
      const { data: newProgress, error } = await supabase
        .from('progress')
        .insert({
          solution_id: solutionId,
          current_module: 0,
          is_completed: false,
          completed_modules: [],
          last_activity: new Date().toISOString(),
          implementation_status: 'in_progress',
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Registrar evento analítico
      await supabase.from('analytics').insert({
        event_type: 'solution_started',
        solution_id: solutionId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        event_data: { solution_name: solution.title }
      });
      
      // Incrementar métricas
      await supabase.rpc('increment', {
        row_id: solutionId,
        table_name: 'solution_metrics',
        column_name: 'total_starts'
      });
      
      setProgress(newProgress);
      navigate(`/implementation/${solutionId}/0`);
      
      toast.success('Implementação iniciada!', {
        description: `Vamos começar a implementar ${solution.title}`,
      });
    } catch (err) {
      console.error('Erro ao iniciar implementação:', err);
      toast.error('Erro ao iniciar', {
        description: 'Não foi possível iniciar a implementação. Tente novamente.',
      });
    } finally {
      setInitializing(false);
    }
  }, [solutionId, solution, navigate]);
  
  // Continuar uma implementação em andamento
  const continueImplementation = useCallback(() => {
    if (!solutionId || !progress) return;
    navigate(`/implementation/${solutionId}/${progress.current_module}`);
  }, [solutionId, progress, navigate]);

  // Toggle favorito
  const toggleFavorite = useCallback(async () => {
    // Implementação futura
    toast.info('Funcionalidade em desenvolvimento');
  }, []);

  // Download de materiais
  const downloadMaterials = useCallback(async () => {
    // Implementação futura
    toast.info('Funcionalidade em desenvolvimento');
  }, []);
  
  return {
    initializing,
    progress,
    startImplementation,
    continueImplementation,
    toggleFavorite,
    downloadMaterials
  };
};
