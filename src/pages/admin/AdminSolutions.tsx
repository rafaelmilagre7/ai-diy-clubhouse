
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { toast } from "sonner";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SolutionsManagementSidebar } from "@/components/admin/solutions/SolutionsManagementSidebar";
import { SolutionsTable } from "@/components/admin/solutions/SolutionsTable";
import { SolutionsMetrics } from "@/components/admin/solutions/SolutionsMetrics";
import { SolutionDetailsPanel } from "@/components/admin/solutions/SolutionDetailsPanel";

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Management Sidebar */}
        <SolutionsManagementSidebar 
          filters={filters}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          totalSolutions={solutions.length}
          filteredCount={filteredSolutions.length}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b bg-card/30 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl font-semibold">Gestão de Soluções</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredSolutions.length} de {solutions.length} soluções
                </p>
              </div>
            </div>
            
            <Button onClick={() => navigate("/admin/solutions/new")} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Solução
            </Button>
          </header>

          {/* Metrics */}
          <div className="p-6 border-b">
            <SolutionsMetrics solutions={solutions} />
          </div>

          {/* Content Area */}
          <div className="flex-1 flex">
            {/* Solutions Table */}
            <div className={`transition-all duration-300 ${selectedSolution ? 'flex-[2]' : 'flex-1'}`}>
              <SolutionsTable
                solutions={filteredSolutions}
                onSolutionSelect={setSelectedSolution}
                onEdit={(id) => navigate(`/admin/solutions/${id}/edit`)}
                onDelete={handleDeleteSolution}
                onTogglePublish={handleTogglePublish}
                selectedSolution={selectedSolution}
              />
            </div>

            {/* Details Panel */}
            {selectedSolution && (
              <div className="flex-1 border-l">
                <SolutionDetailsPanel
                  solution={selectedSolution}
                  onClose={() => setSelectedSolution(null)}
                  onEdit={() => navigate(`/admin/solutions/${selectedSolution.id}/edit`)}
                  onDelete={() => handleDeleteSolution(selectedSolution.id)}
                  onTogglePublish={(published) => handleTogglePublish(selectedSolution.id, published)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminSolutions;
