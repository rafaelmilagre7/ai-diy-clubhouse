
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/lib/supabase/types/legacy';

export const useSolutionsAdmin = () => {
  const navigate = useNavigate();
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
      
      // Buscar todas as soluções da tabela restaurada
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar soluções:', error);
        throw error;
      }

      // Mapear as soluções para o formato esperado pelo frontend
      const mappedSolutions = (data || []).map(solution => ({
        ...solution,
        // Garantir que os campos obrigatórios existam
        slug: solution.slug || `${solution.title?.toLowerCase().replace(/\s+/g, '-') || 'solucao'}-${solution.id}`,
        category: solution.category || 'Operacional'
      }));

      setSolutions(mappedSolutions);
      
      console.log(`✅ Carregadas ${mappedSolutions.length} soluções da tabela restaurada`);
      
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

  const handleEdit = (id: string) => {
    console.log('🔧 [DEBUG] Iniciando edição da solução:', id);
    try {
      navigate(`/admin/solutions/${id}`);
      console.log('✅ [DEBUG] Navegação para edição executada com sucesso');
    } catch (error) {
      console.error('❌ [DEBUG] Erro na navegação:', error);
      toast({
        title: 'Erro na navegação',
        description: 'Não foi possível acessar o editor da solução.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (solutionId: string) => {
    try {
      const { error } = await supabase
        .from('solutions')
        .delete()
        .eq('id', solutionId);

      if (error) throw error;

      setSolutions(solutions.filter(solution => solution.id !== solutionId));
      
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
    }
  };

  const handleTogglePublish = async (solutionId: string, newPublishedState: boolean) => {
    try {
      const { error } = await supabase
        .from('solutions')
        .update({ published: newPublishedState })
        .eq('id', solutionId);

      if (error) throw error;

      setSolutions(prev => prev.map(solution => 
        solution.id === solutionId 
          ? { ...solution, published: newPublishedState }
          : solution
      ));

      toast({
        title: newPublishedState ? 'Solução publicada' : 'Solução despublicada',
        description: `A solução foi ${newPublishedState ? 'publicada' : 'despublicada'} com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao alterar status de publicação:', error);
      toast({
        title: 'Erro ao alterar status',
        description: 'Não foi possível alterar o status da solução.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!solutionToDelete) return;
    await handleDelete(solutionToDelete);
    setDeleteDialogOpen(false);
    setSolutionToDelete(null);
  };

  const handleCreateNew = () => {
    console.log('🆕 [DEBUG] Navegando para criação de nova solução');
    navigate('/admin/solutions/new');
  };

  return {
    solutions,
    loading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    solutionToDelete,
    setSolutionToDelete,
    handleDeleteConfirm,
    handleEdit,
    handleDelete,
    handleTogglePublish,
    handleCreateNew,
    totalSolutions: solutions.length,
    publishedSolutions: solutions.filter(s => s.published).length
  };
};
