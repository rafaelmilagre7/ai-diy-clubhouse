
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { useLogging } from '@/hooks/useLogging';
import { useEffect } from 'react';

export const useTools = () => {
  const { log, logError } = useLogging();
  const queryClient = useQueryClient();

  // Prefetch e prime do cache para melhorar a experiência do usuário
  useEffect(() => {
    // Trigger prefetch
    prefetchTools();
  }, []);

  // Função para prefetch isolada para reuso
  const prefetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Atualiza o cache diretamente
      queryClient.setQueryData(['tools'], data);
      
      // Prefetch de imagens (logos das ferramentas)
      data?.forEach(tool => {
        if (tool.logo_url) {
          const img = new Image();
          img.src = tool.logo_url;
        }
      });
      
      log('Ferramentas pré-carregadas com sucesso', { count: data?.length || 0 });
    } catch (err) {
      logError('Erro no pré-carregamento de ferramentas:', err);
    }
  };

  // Verificar se existem ferramentas em cache
  const cachedTools = queryClient.getQueryData<Tool[]>(['tools']);

  const query = useQuery<Tool[], Error>({
    queryKey: ['tools'],
    queryFn: async () => {
      log('Buscando ferramentas...');
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('name');

      if (error) {
        logError('Erro ao buscar ferramentas:', error);
        throw error;
      }

      log('Ferramentas encontradas:', { 
        total: data.length,
        comLogo: data.filter(t => t.logo_url).length,
        semLogo: data.filter(t => !t.logo_url).length
      });

      return data as Tool[];
    },
    placeholderData: cachedTools, // Usar dados em cache para renderização instantânea
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    refetchOnWindowFocus: false, // Não buscar novamente ao focar a janela
  });

  return {
    tools: query.data || [],
    isLoading: query.isLoading && !cachedTools, // Somente loading se não tiver cache
    error: query.error,
    refetch: query.refetch,
    prefetchTools,
    isFetched: query.isFetched
  };
};
