
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/types/solution';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

export const useSolutionsData = (
  activeCategory: string = 'all',
  searchQuery: string = '',
  difficulty: string = 'all'
) => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();
  const isAdmin = profile?.role === 'admin';

  // Função para buscar soluções
  const fetchSolutions = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Buscando soluções', { category: activeCategory, search: searchQuery, difficulty });

      // Construir a consulta base
      let query = supabase
        .from('solutions')
        .select('*');

      // Aplicar filtro apenas para soluções publicadas, exceto para admins
      if (!isAdmin) {
        query = query.eq('published', true);
      }

      // Aplicar filtro de categoria se não for 'all'
      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }
      
      // Aplicar filtro de dificuldade se não for 'all'
      if (difficulty !== 'all') {
        query = query.eq('difficulty', difficulty);
      }

      // Ordenar por data de criação mais recente
      query = query.order('created_at', { ascending: false });

      // Executar a consulta
      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        console.log('Soluções carregadas com sucesso', { count: data.length });
        setSolutions(data as Solution[]);
      } else {
        setSolutions([]);
      }

      setError(null);
    } catch (err) {
      console.error('Erro ao buscar soluções:', err);
      setError(err instanceof Error ? err : new Error('Erro ao buscar soluções'));
      
      // Notificar o usuário sobre o erro
      toast({
        title: "Erro ao carregar soluções",
        description: "Ocorreu um problema ao buscar as soluções. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [activeCategory, isAdmin, searchQuery, difficulty, toast]);

  // Buscar soluções ao montar o componente ou quando os filtros mudarem
  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  // Filtrar soluções por termo de busca (client-side)
  const filteredSolutions = useMemo(() => {
    if (!searchQuery) return solutions;

    const lowerCaseQuery = searchQuery.toLowerCase();
    
    return solutions.filter(solution => 
      solution.title.toLowerCase().includes(lowerCaseQuery) || 
      (solution.description && solution.description.toLowerCase().includes(lowerCaseQuery)) ||
      (solution.tags && Array.isArray(solution.tags) && solution.tags.some(tag => 
        tag && tag.toLowerCase().includes(lowerCaseQuery)
      ))
    );
  }, [solutions, searchQuery]);

  return {
    solutions,
    filteredSolutions,
    loading,
    error,
    refetch: fetchSolutions
  };
};
