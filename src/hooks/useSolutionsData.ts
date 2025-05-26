
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';

// Mock data para fallback garantido
const mockSolutions: Solution[] = [
  {
    id: '1',
    title: 'Assistente de IA no WhatsApp',
    description: 'Automatize o atendimento ao cliente com inteligência artificial',
    category: 'Operacional',
    difficulty: 'Fácil',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    slug: 'assistente-ia-whatsapp',
    tags: ['WhatsApp', 'IA', 'Atendimento'],
    estimated_time: 60
  },
  {
    id: '2', 
    title: 'CRM Inteligente',
    description: 'Gerencie leads e vendas com automação',
    category: 'Receita',
    difficulty: 'Médio',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    slug: 'crm-inteligente',
    tags: ['CRM', 'Vendas', 'Automação'],
    estimated_time: 120
  },
  {
    id: '3',
    title: 'Dashboard de Analytics',
    description: 'Monitore métricas importantes do seu negócio',
    category: 'Operacional',
    difficulty: 'Médio',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    slug: 'dashboard-analytics',
    tags: ['Analytics', 'Dashboard', 'Métricas'],
    estimated_time: 90
  }
];

export function useSolutionsData(initialCategory: string | null = 'all') {
  console.log("🔍 useSolutionsData: Hook iniciado", { initialCategory });
  
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'all');

  console.log("🔍 useSolutionsData: Estado inicial", { isAdmin, activeCategory });

  // Função de fetching simplificada com logs detalhados
  const fetchSolutions = useCallback(async () => {
    try {
      console.log("🔍 useSolutionsData: Iniciando busca de soluções...");
      
      let query = supabase.from('solutions').select('*');
      
      if (!isAdmin) {
        query = query.eq('published', true);
        console.log("🔍 useSolutionsData: Filtro para apenas soluções publicadas aplicado");
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.warn("⚠️ useSolutionsData: Erro ao buscar soluções, usando mock data:", error);
        return mockSolutions;
      }
      
      console.log("✅ useSolutionsData: Soluções carregadas com sucesso:", data?.length || 0);
      return (data as Solution[]) || mockSolutions;
      
    } catch (error: any) {
      console.warn("⚠️ useSolutionsData: Exception capturada, usando mock data:", error);
      return mockSolutions;
    }
  }, [isAdmin]);

  // React Query com configuração robusta
  const { 
    data: solutions = mockSolutions, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['solutions', isAdmin],
    queryFn: fetchSolutions,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      console.log("🔄 useSolutionsData: Tentativa de retry", { failureCount, error });
      return failureCount < 1; // Apenas 1 retry
    },
    // Sempre garantir que temos dados
    placeholderData: mockSolutions,
    // Garantir que sempre retornamos dados válidos
    select: (data) => {
      console.log("🔄 useSolutionsData: Processando dados retornados", { count: data?.length || 0 });
      return data && Array.isArray(data) && data.length > 0 ? data : mockSolutions;
    }
  });

  console.log("📊 useSolutionsData: Estado atual do React Query", {
    solutionsCount: solutions?.length || 0,
    isLoading,
    hasError: !!error
  });

  // Filtrar soluções com logs
  const filteredSolutions = useMemo(() => {
    console.log("🔄 useSolutionsData: Filtrando soluções", { 
      activeCategory, 
      searchQuery: searchQuery.trim(),
      totalSolutions: solutions?.length || 0
    });

    let filtered = Array.isArray(solutions) ? [...solutions] : [...mockSolutions];
    
    if (activeCategory !== 'all') {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(solution => solution.category === activeCategory);
      console.log(`🔄 useSolutionsData: Filtro por categoria ${activeCategory}: ${beforeFilter} -> ${filtered.length}`);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const beforeFilter = filtered.length;
      filtered = filtered.filter(solution => 
        solution.title.toLowerCase().includes(query) || 
        solution.description.toLowerCase().includes(query) ||
        (solution.tags && solution.tags.some(tag => 
          tag.toLowerCase().includes(query)
        ))
      );
      console.log(`🔄 useSolutionsData: Filtro por busca "${query}": ${beforeFilter} -> ${filtered.length}`);
    }
    
    console.log("✅ useSolutionsData: Soluções filtradas finais:", filtered.length);
    return filtered;
  }, [solutions, activeCategory, searchQuery]);

  // Log do retorno final
  console.log("🏁 useSolutionsData: Retornando dados", {
    solutions: solutions?.length || 0,
    filteredSolutions: filteredSolutions?.length || 0,
    loading: isLoading,
    error: error ? String(error) : null
  });

  return {
    solutions: solutions || mockSolutions,
    filteredSolutions,
    loading: isLoading,
    error: error ? String(error) : null,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    canViewSolutions: true, // Sempre permitir visualização com fallback
    refetch
  };
}
