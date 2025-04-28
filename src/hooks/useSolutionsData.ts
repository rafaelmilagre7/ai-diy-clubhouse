
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/lib/supabase';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export function useSolutionsData(initialCategory: string | null = 'all') {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'all');

  // Implementar função de fetching separadamente para melhor controle
  const fetchSolutions = useCallback(async () => {
    try {
      console.log('Buscando soluções do banco de dados...');
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar soluções:', error);
        toast("Erro ao carregar soluções. Por favor, tente novamente.");
        throw error;
      }
      
      console.log(`Encontradas ${data?.length || 0} soluções`);
      return data as Solution[] || [];
    } catch (error: any) {
      console.error('Erro ao buscar soluções:', error);
      toast("Não foi possível carregar as soluções disponíveis.");
      return [];
    }
  }, []);

  // Usar React Query para cache e refetch
  const { data: solutions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['solutions'],
    queryFn: fetchSolutions,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    refetchOnWindowFocus: false, // Não refetch ao focar a janela
    retry: 2, // Limitar número de tentativas
  });

  // Filtrar soluções por categoria e pesquisa
  const filteredSolutions = useMemo(() => {
    console.log(`Filtrando ${solutions.length} soluções por categoria: ${activeCategory} e busca: "${searchQuery}"`);
    
    let filtered = [...solutions];
    
    // Filtrar por categoria
    if (activeCategory !== 'all') {
      filtered = filtered.filter(solution => solution.category === activeCategory);
    }
    
    // Filtrar por pesquisa
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(solution => 
        solution.title?.toLowerCase().includes(query) || 
        solution.description?.toLowerCase().includes(query) ||
        (solution.tags && solution.tags.some(tag => 
          tag.toLowerCase().includes(query)
        ))
      );
    }
    
    console.log(`Filtragem resultou em ${filtered.length} soluções`);
    return filtered;
  }, [solutions, activeCategory, searchQuery]);

  // Fornecer função para forçar recarga de dados
  const refreshSolutions = useCallback(() => {
    console.log('Forçando recarga de soluções...');
    refetch();
  }, [refetch]);

  return {
    solutions,
    filteredSolutions,
    loading: isLoading,
    error: error ? String(error) : null,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    refreshSolutions
  };
}
