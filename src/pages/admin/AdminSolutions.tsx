
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { toast } from "sonner";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SolutionsTable } from "@/components/admin/solutions/SolutionsTable";
import { SolutionsMetrics } from "@/components/admin/solutions/SolutionsMetrics";
import { SolutionsFiltersAside } from "@/components/admin/solutions/SolutionsFiltersAside";

const AdminSolutions = () => {
  const navigate = useNavigate();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: 'all',
    status: 'all',
    difficulty: 'all'
  });

  // Fetch solutions from database
  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSolutions(data || []);
      } catch (error: any) {
        console.error("Erro ao buscar soluções:", error);
        toast.error("Erro ao carregar soluções", {
          description: error.message || "Não foi possível carregar as soluções."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
  }, []);

  const handleDeleteSolution = async (solutionId: string) => {
    try {
      const { error } = await supabase
        .from("solutions")
        .delete()
        .eq("id", solutionId);

      if (error) throw error;

      setSolutions(prev => prev.filter(solution => solution.id !== solutionId));
      setSelectedSolution(null);
      toast.success("Solução excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir solução:", error);
      toast.error("Erro ao excluir solução", {
        description: error.message || "Não foi possível excluir a solução."
      });
    }
  };

  const handleTogglePublish = async (solutionId: string, newPublishedState: boolean) => {
    try {
      const { error } = await supabase
        .from("solutions")
        .update({ published: newPublishedState })
        .eq("id", solutionId);

      if (error) throw error;

      const updatedSolutions = solutions.map(solution => 
        solution.id === solutionId 
          ? { ...solution, published: newPublishedState }
          : solution
      );
      
      setSolutions(updatedSolutions);
      
      // Update selected solution if it's the one being updated
      if (selectedSolution?.id === solutionId) {
        setSelectedSolution({ ...selectedSolution, published: newPublishedState });
      }

      toast.success(
        newPublishedState 
          ? "Solução publicada com sucesso!" 
          : "Solução despublicada com sucesso!"
      );
    } catch (error: any) {
      console.error("Erro ao alterar status de publicação:", error);
      toast.error("Erro ao alterar status", {
        description: error.message || "Não foi possível alterar o status da solução."
      });
    }
  };

  // Filter solutions based on current filters
  const filteredSolutions = solutions.filter(solution => {
    const matchesSearch = solution.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         solution.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesCategory = filters.category === 'all' || solution.category === filters.category;
    
    const matchesDifficulty = filters.difficulty === 'all' || solution.difficulty === filters.difficulty;
    
    const matchesStatus = filters.status === 'all' ||
                         (filters.status === 'published' && solution.published) ||
                         (filters.status === 'draft' && !solution.published);

    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      category: 'all', 
      status: 'all',
      difficulty: 'all'
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Soluções</h1>
          <p className="text-muted-foreground">
            Gerencie todas as soluções disponíveis na plataforma. 
            {solutions.length > 0 && (
              <span className="ml-1">
                {filteredSolutions.length} de {solutions.length} soluções
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => navigate("/admin/solutions/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Solução
        </Button>
      </div>

      {/* Metrics */}
      <div className="mb-6">
        <SolutionsMetrics solutions={solutions} />
      </div>

      {/* Content with Aside Filters */}
      <div className="flex gap-6">
        {/* Filters Aside */}
        <aside className="w-64 flex-shrink-0">
          <SolutionsFiltersAside
            filters={filters}
            onFilterChange={updateFilter}
            onResetFilters={resetFilters}
            totalSolutions={solutions.length}
            filteredCount={filteredSolutions.length}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <SolutionsTable
            solutions={filteredSolutions}
            onSolutionSelect={setSelectedSolution}
            onEdit={(id) => navigate(`/admin/solutions/${id}`)}
            onDelete={handleDeleteSolution}
            onTogglePublish={handleTogglePublish}
            selectedSolution={selectedSolution}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminSolutions;
