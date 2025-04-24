
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { useCentralDataStore } from "@/hooks/useCentralDataStore";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Solution } from "@/lib/supabase";
import { LoadingPage } from "@/components/ui/loading-states";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Usar nosso hook centralizado de dados
  const { 
    categorizedSolutions,
    isLoading,
    prefetchSolution
  } = useCentralDataStore();
  
  const [category, setCategory] = useState<string>(
    searchParams.get("category") || "general"
  );
  
  // Função para lidar com a mudança de categoria
  const handleCategoryChange = useCallback((newCategory: string) => {
    setCategory(newCategory);
    setSearchParams({ category: newCategory });
  }, [setSearchParams]);

  // Função para navegar para a página de detalhes da solução
  const handleSolutionClick = useCallback((solution: Solution) => {
    // Prefetch dos dados da solução para carregamento rápido
    prefetchSolution(solution.id);
    
    // Navegar para página de detalhes
    navigate(`/solution/${solution.id}`);
  }, [navigate, prefetchSolution]);

  // Efeito para mostrar toast na primeira visita - executado apenas 1 vez
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstDashboardVisit") !== "false";
    
    if (isFirstVisit) {
      toast("Bem-vindo ao seu dashboard personalizado!");
      localStorage.setItem("firstDashboardVisit", "false");
    }
  }, []);

  // Mostrar tela de carregamento enquanto os dados estão sendo carregados
  if (isLoading) {
    return (
      <LoadingPage 
        message="Carregando seu dashboard" 
        description="Estamos preparando sua experiência personalizada do VIVER DE IA Club..." 
      />
    );
  }

  return (
    <DashboardLayout
      active={categorizedSolutions.active}
      completed={categorizedSolutions.completed}
      recommended={categorizedSolutions.recommended}
      category={category}
      onCategoryChange={handleCategoryChange}
      onSolutionClick={handleSolutionClick}
    />
  );
};

export default Dashboard;
