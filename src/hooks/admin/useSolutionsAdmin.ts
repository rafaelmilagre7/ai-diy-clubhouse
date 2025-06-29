
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/types/solutionTypes';

export const useSolutionsAdmin = () => {
  const { toast } = useToast();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [solutionToDelete, setSolutionToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSolutions(data || []);
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

  const handleDeleteConfirm = async () => {
    if (!solutionToDelete) return;

    try {
      const { error } = await supabase
        .from('solutions')
        .delete()
        .eq('id', solutionToDelete);

      if (error) throw error;

      setSolutions(solutions.filter(solution => solution.id !== solutionToDelete));
      
      toast({
        title: 'Solução excluída',
        description: 'A solução foi excluída com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao excluir solução:', error.message);
      toast({
        title: 'Erro ao excluir solução',
        description: 'Não foi possível excluir a solução.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSolutionToDelete(null);
    }
  };

  return {
    solutions,
    loading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    solutionToDelete,
    setSolutionToDelete,
    handleDeleteConfirm
  };
};
