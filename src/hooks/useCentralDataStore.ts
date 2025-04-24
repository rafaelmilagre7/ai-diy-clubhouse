
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useCentralDataStore = () => {
  const { user, profile } = useAuth();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const isAdmin = profile?.role === 'admin';

  // Buscar todas as soluções
  const { data, isLoading: loadingSolutions, error } = useQuery({
    queryKey: ['solutions'],
    queryFn: async () => {
      console.log('Buscando soluções no CentralDataStore...');
      
      // Construir query - filtrar para mostrar apenas publicadas se usuário não for admin
      let query = supabase.from('solutions').select('*');
      if (!isAdmin) {
        query = query.eq('published', true);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar soluções:', error);
        throw error;
      }
      
      console.log(`${data?.length || 0} soluções encontradas`);
      setSolutions(data || []);
      return data;
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Pré-carregar detalhes de uma solução específica
  const fetchSolutionDetails = async (solutionId: string) => {
    try {
      console.log(`Pré-carregando detalhes da solução: ${solutionId}`);
      await supabase.from('solutions').select('*').eq('id', solutionId).single();
      
      // Também podemos pré-carregar módulos relacionados
      await supabase.from('modules').select('*').eq('solution_id', solutionId);
      
      console.log('Pré-carregamento concluído com sucesso');
    } catch (error) {
      console.error('Erro ao pré-carregar detalhes:', error);
    }
  };

  // Efeito para lidar com erros
  useEffect(() => {
    if (error) {
      console.error('Erro no CentralDataStore:', error);
      toast.error('Houve um erro ao carregar os dados. Tente novamente mais tarde.');
    }
  }, [error]);

  return {
    solutions,
    loadingSolutions,
    fetchSolutionDetails,
    error
  };
};

export default useCentralDataStore;
