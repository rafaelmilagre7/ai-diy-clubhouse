
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Solution {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const useSolutions = () => {
  const { toast } = useToast();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSolutions, setFilteredSolutions] = useState<Solution[]>([]);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const solutionsData = (data || []).map(solution => ({
        id: solution.id,
        title: solution.title,
        category: solution.category,
        difficulty: solution.difficulty,
        is_published: solution.is_published || false,
        created_at: solution.created_at,
        updated_at: solution.updated_at
      }));

      setSolutions(solutionsData);
      setFilteredSolutions(solutionsData);
    } catch (error: any) {
      console.error('Erro ao buscar soluções:', error.message);
      toast({
        title: 'Erro ao carregar soluções',
        description: 'Não foi possível carregar a lista de soluções.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const searchSolutions = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredSolutions(solutions);
      return;
    }

    const filtered = solutions.filter(solution =>
      solution.title.toLowerCase().includes(query.toLowerCase()) ||
      solution.category.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSolutions(filtered);
  };

  useEffect(() => {
    fetchSolutions();
  }, []);

  return {
    solutions: filteredSolutions,
    loading,
    searchQuery,
    searchSolutions,
    refetch: fetchSolutions
  };
};
