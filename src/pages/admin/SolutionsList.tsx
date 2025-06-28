
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/lib/supabase/types';
import { SolutionsHeader } from '@/components/admin/solutions/SolutionsHeader';
import { SolutionsTable } from '@/components/admin/solutions/SolutionsTable';
import { DeleteSolutionDialog } from '@/components/admin/solutions/DeleteSolutionDialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const SolutionsList = () => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [filteredSolutions, setFilteredSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSolutions();
  }, []);

  useEffect(() => {
    filterSolutions();
  }, [searchQuery, categoryFilter, statusFilter, solutions]);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear dados para o formato Solution esperado
      const mappedSolutions: Solution[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        category: item.category,
        difficulty: item.difficulty_level as 'easy' | 'medium' | 'advanced', // Mapear difficulty_level para difficulty
        difficulty_level: item.difficulty_level,
        slug: item.title.toLowerCase().replace(/\s+/g, '-'), // Gerar slug
        published: item.is_published || false, // Mapear is_published para published
        is_published: item.is_published || false,
        estimated_time_hours: item.estimated_time_hours,
        roi_potential: item.roi_potential,
        implementation_steps: item.implementation_steps,
        required_tools: item.required_tools,
        success_metrics: item.success_metrics,
        created_at: item.created_at,
        updated_at: item.updated_at,
        cover_image_url: item.cover_image_url,
        thumbnail_url: item.thumbnail_url
      }));
      
      setSolutions(mappedSolutions);
      setFilteredSolutions(mappedSolutions);
    } catch (error: any) {
      console.error('Erro ao buscar soluções:', error);
      toast({
        title: "Erro ao carregar soluções",
        description: error.message || "Ocorreu um erro ao carregar as soluções.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSolutions = () => {
    let filtered = solutions;

    if (searchQuery) {
      filtered = filtered.filter(solution =>
        solution.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        solution.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(solution => 
        solution.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (statusFilter !== 'all') {
      const isPublished = statusFilter === 'published';
      filtered = filtered.filter(solution => solution.published === isPublished);
    }

    setFilteredSolutions(filtered);
  };

  const handleDeleteClick = (solution: Solution) => {
    setSelectedSolution(solution);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSolution) return;

    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('solutions')
        .delete()
        .eq('id', selectedSolution.id);

      if (error) throw error;

      toast({
        title: "Solução excluída",
        description: "A solução foi excluída com sucesso.",
      });

      // Atualizar lista local removendo a solução excluída
      const updatedSolutions = solutions.filter(s => s.id !== selectedSolution.id);
      setSolutions(updatedSolutions);
      setFilteredSolutions(updatedSolutions);
      
      setShowDeleteDialog(false);
      setSelectedSolution(null);
    } catch (error: any) {
      console.error('Erro ao excluir solução:', error);
      toast({
        title: "Erro ao excluir solução",
        description: error.message || "Ocorreu um erro ao excluir a solução.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublishToggle = async (solution: Solution) => {
    try {
      const newPublishedStatus = !solution.published;
      
      const { error } = await supabase
        .from('solutions')
        .update({ 
          is_published: newPublishedStatus // Usar is_published no banco
        })
        .eq('id', solution.id);

      if (error) throw error;

      toast({
        title: `Solução ${newPublishedStatus ? 'publicada' : 'despublicada'}`,
        description: `A solução foi ${newPublishedStatus ? 'publicada' : 'despublicada'} com sucesso.`,
      });

      // Atualizar lista local
      const updatedSolutions = solutions.map(s => 
        s.id === solution.id 
          ? { ...s, published: newPublishedStatus, is_published: newPublishedStatus }
          : s
      );
      setSolutions(updatedSolutions);
      setFilteredSolutions(updatedSolutions);
    } catch (error: any) {
      console.error('Erro ao alterar status da solução:', error);
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Ocorreu um erro ao alterar o status da solução.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SolutionsHeader
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onCategoryChange={setCategoryFilter}
          onStatusChange={setStatusFilter}
          onRefresh={fetchSolutions}
        />
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SolutionsHeader
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onCategoryChange={setCategoryFilter}
        onStatusChange={setStatusFilter}
        onRefresh={fetchSolutions}
      />

      <SolutionsTable
        solutions={filteredSolutions}
        onEdit={(solution) => window.location.href = `/admin/solutions/${solution.id}/edit`}
        onDelete={handleDeleteClick}
        onPublishToggle={handlePublishToggle}
      />

      <DeleteSolutionDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        solution={selectedSolution}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default SolutionsList;
