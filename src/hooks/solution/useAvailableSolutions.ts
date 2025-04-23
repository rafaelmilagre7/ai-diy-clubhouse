
import { useState, useEffect } from 'react';
import { Solution } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';

export const useAvailableSolutions = () => {
  const [availableSolutions, setAvailableSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const { log, logError } = useLogging('useAvailableSolutions');

  useEffect(() => {
    const fetchAvailableSolutions = async () => {
      try {
        setLoading(true);
        // Construir a consulta base
        let query = supabase
          .from('solutions')
          .select('*');

        // Aplicar filtro apenas para soluções publicadas, exceto para admins
        if (!isAdmin) {
          query = query.eq('published', true);
        }

        // Ordenar por data de criação mais recente
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;

        if (error) throw error;

        setAvailableSolutions(data as Solution[]);
      } catch (err) {
        logError('Erro ao buscar soluções disponíveis:', err);
        setAvailableSolutions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSolutions();
  }, [isAdmin, log, logError]);

  return { availableSolutions, loading };
};
