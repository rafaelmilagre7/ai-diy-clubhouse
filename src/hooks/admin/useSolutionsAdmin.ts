
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/lib/supabase/types/legacy';

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
      
      // Buscar soluções da tabela restaurada
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erro ao buscar soluções:', error);
        // Se a tabela não existir, usar dados mock
        setSolutions([
          {
            id: 'mock-1',
            title: 'Assistente Virtual WhatsApp',
            description: 'Implemente um assistente virtual completo para WhatsApp Business usando IA',
            category: 'automacao',
            difficulty: 'intermediario' as 'easy' | 'medium' | 'advanced',
            published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            slug: 'assistente-virtual-whatsapp'
          },
          {
            id: 'mock-2',
            title: 'Automação de E-mail Marketing',
            description: 'Configure campanhas automatizadas de e-mail com segmentação inteligente',
            category: 'marketing',
            difficulty: 'iniciante' as 'easy' | 'medium' | 'advanced',
            published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            slug: 'automacao-email-marketing'
          }
        ]);
        return;
      }

      // Mapear dificuldades para o formato esperado pelo frontend
      const mappedSolutions = (data || []).map(solution => ({
        ...solution,
        difficulty: mapDifficultyToEnglish(solution.difficulty)
      }));

      setSolutions(mappedSolutions);
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

  // Mapear dificuldades do português para inglês
  const mapDifficultyToEnglish = (difficulty: string): 'easy' | 'medium' | 'advanced' => {
    switch (difficulty?.toLowerCase()) {
      case 'iniciante':
        return 'easy';
      case 'intermediario':
      case 'intermediário':
        return 'medium';
      case 'avancado':
      case 'avançado':
        return 'advanced';
      default:
        return 'easy';
    }
  };

  const handleEdit = (id: string) => {
    // Implementar navegação para edição
    window.location.href = `/admin/solutions/${id}`;
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
    window.location.href = '/admin/solutions/new';
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
