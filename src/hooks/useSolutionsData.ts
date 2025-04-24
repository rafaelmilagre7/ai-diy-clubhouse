
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';

// Otimização: Usar React Query para cache e gerenciamento de estado
export function useSolutionsData() {
  const { toast } = useToast();

  // Implementar função de fetching separadamente para melhor controle
  const fetchSolutions = useCallback(async () => {
    try {
      console.log('Fetching solutions from database...');
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('published', true)
        .order('priority', { ascending: true });
      
      if (error) throw error;
      
      return data as Solution[];
    } catch (error: any) {
      console.error('Erro ao buscar soluções:', error);
      toast({
        title: 'Erro ao carregar soluções',
        description: 'Não foi possível carregar as soluções disponíveis.',
        variant: 'destructive',
      });
      return [];
    }
  }, [toast]);

  // Usar React Query para cache e refetch
  const { data, isLoading, error } = useQuery({
    queryKey: ['solutions'],
    queryFn: fetchSolutions,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    refetchOnWindowFocus: false, // Não refetch ao focar a janela
  });

  return {
    solutions: data || [],
    loading: isLoading,
    error: error ? String(error) : null,
  };
}
