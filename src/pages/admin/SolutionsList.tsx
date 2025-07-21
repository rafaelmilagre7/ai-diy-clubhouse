
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase/types/legacy";
import { toast } from "sonner";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SolutionsTable } from "@/components/admin/solutions/SolutionsTable";
import { SolutionsHeader } from "@/components/admin/solutions/SolutionsHeader";
import { SolutionsFilters } from "@/components/admin/solutions/SolutionsFilters";
import { useSolutionsFilters } from "@/hooks/admin/useSolutionsFilters";
import { getCategoryDetails } from "@/lib/types/categoryTypes";

const SolutionsList = () => {
  const navigate = useNavigate();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  
  const {
    filters,
    filteredSolutions,
    updateFilter,
    resetFilters
  } = useSolutionsFilters(solutions as any);

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
        setSolutions(data as Solution[] || []);
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

      setSolutions(prev => prev.map(solution => 
        solution.id === solutionId 
          ? { ...solution, published: newPublishedState }
          : solution
      ));

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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <SolutionsHeader
        totalSolutions={solutions.length}
        publishedSolutions={solutions.filter(s => s.published).length}
        onCreateNew={() => navigate("/admin/solutions/new")}
      />

      <SolutionsFilters
        filters={filters}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
      />

      <SolutionsTable
        solutions={filteredSolutions as any[]}
        onEdit={(id) => navigate(`/admin/solutions/${id}/edit`)}
        onDelete={handleDeleteSolution}
        onTogglePublish={handleTogglePublish}
        getCategoryDetails={getCategoryDetails}
      />
    </div>
  );
};

export default SolutionsList;
