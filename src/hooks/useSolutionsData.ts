
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';

// Mock data para fallback
const mockSolutions: Solution[] = [
  {
    id: '1',
    title: 'Assistente de IA no WhatsApp',
    description: 'Automatize o atendimento ao cliente com inteligência artificial',
    category: 'Operacional',
    difficulty: 'Fácil',
    published: true,
    created_at: new Date().toISOString(),
    tags: ['WhatsApp', 'IA', 'Atendimento'],
    estimated_time: 60,
    modules: []
  },
  {
    id: '2', 
    title: 'CRM Inteligente',
    description: 'Gerencie leads e vendas com automação',
    category: 'Receita',
    difficulty: 'Médio',
    published: true,
    created_at: new Date().toISOString(),
    tags: ['CRM', 'Vendas', 'Automação'],
    estimated_time: 120,
    modules: []
  }
];

export function useSolutionsData(initialCategory: string | null = 'all') {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'all');

  console.log('useSolutionsData: Iniciando hook', { isAdmin, activeCategory });

  // Função de fetching simplificada
  const fetchSolutions = useCallback(async () => {
    try {
      console.log('useSolutionsData: Buscando soluções...');
      
      let query = supabase.from('solutions').select('*');
      
      if (!isAdmin) {
        query = query.eq('published', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.warn('useSolutionsData: Erro ao buscar soluções, usando mock data:', error);
        return mockSolutions;
      }
      
      console.log('useSolutionsData: Soluções carregadas com sucesso:', data?.length);
      return (data as Solution[]) || mockSolutions;
      
    } catch (error: any) {
      console.warn('useSolutionsData: Exception, usando mock data:', error);
      return mockSolutions;
    }
  }, [isAdmin]);

  // Usar React Query com configuração mais robusta
  const { data: solutions = mockSolutions, isLoading, error } = useQuery({
    queryKey: ['solutions', isAdmin],
    queryFn: fetchSolutions,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    // Sempre retornar mock data em caso de erro
    placeholderData: mockSolutions,
  });

  // Filtrar soluções
  const filteredSolutions = useMemo(() => {
    let filtered = [...solutions];
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(solution => solution.category === activeCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(solution => 
        solution.title.toLowerCase().includes(query) || 
        solution.description.toLowerCase().includes(query) ||
        (solution.tags && solution.tags.some(tag => 
          tag.toLowerCase().includes(query)
        ))
      );
    }
    
    console.log('useSolutionsData: Soluções filtradas:', filtered.length);
    return filtered;
  }, [solutions, activeCategory, searchQuery]);

  return {
    solutions,
    filteredSolutions,
    loading: isLoading,
    error: error ? String(error) : null,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    canViewSolutions: true // Sempre permitir visualização com fallback
  };
}
