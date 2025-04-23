
import { useState, useEffect } from 'react';
import { Solution } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';

export const useAvailableSolutions = () => {
  const [availableSolutions, setAvailableSolutions] = useState<Solution[]>([]);
  const { log, logError } = useLogging('useAvailableSolutions');

  useEffect(() => {
    const fetchAllSolutions = async () => {
      try {
        const { data, error } = await supabase
          .from('solutions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          log(`Recuperadas ${data.length} soluções para diagnóstico`);
          setAvailableSolutions(data as Solution[]);
        }
      } catch (err) {
        logError('Erro ao buscar lista de soluções:', err);
      }
    };

    fetchAllSolutions();
  }, [log, logError]);

  return { availableSolutions };
};
