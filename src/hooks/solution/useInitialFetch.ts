
import { useState, useEffect } from 'react';
import { Solution } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { supabase } from '@/lib/supabase';

export const useInitialFetch = (solutionId: string | undefined) => {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { log, logError } = useLogging('useInitialFetch');

  useEffect(() => {
    const fetchSolution = async () => {
      if (!solutionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('solutions')
          .select(`
            *,
            modules (*)
          `)
          .eq('id', solutionId)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          throw new Error(`Solução com ID ${solutionId} não encontrada`);
        }

        log('Solução encontrada com sucesso', { 
          id: data.id,
          title: data.title,
          modules: data.modules?.length || 0
        });
        
        setSolution(data as Solution);
        setError(null);
      } catch (err) {
        logError('Erro ao buscar solução:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setSolution(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [solutionId, log, logError]);

  return { solution, loading, error, setSolution };
};
