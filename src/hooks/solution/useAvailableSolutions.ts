
import { useQuery } from '@tanstack/react-query';
import { Solution } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';

export const useAvailableSolutions = () => {
  const { isAdmin } = useAuth();
  const { log, logError } = useLogging('useAvailableSolutions');

  const { data: availableSolutions = [], isLoading: loading } = useQuery({
    queryKey: ['availableSolutions', isAdmin],
    queryFn: async () => {
      try {
        log('Buscando soluções disponíveis');
        
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
        
        log('Soluções disponíveis carregadas', { count: data?.length || 0 });
        return (data || []) as Solution[];
      } catch (err) {
        logError('Erro ao buscar soluções disponíveis:', err);
        return [];
      }
    },
    staleTime: 3 * 60 * 1000 // 3 minutos de cache
  });

  return { availableSolutions, loading };
};
