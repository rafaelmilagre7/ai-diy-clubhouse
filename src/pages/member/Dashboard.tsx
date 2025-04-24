
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
  
  // Debug extensivo para problemas de carregamento
  console.log("Dashboard de membro começou a renderizar - Caminho atual:", window.location.pathname);
  
  // Usar nosso hook centralizado de dados com props corretas
  const { 
    solutions,
    loadingSolutions: isLoading,
    fetchSolutionDetails: prefetchSolution
  } = useCentralDataStore();
  
  useEffect(() => {
    console.log("Dashboard carregado com status:", {
      solutionsLoaded: solutions.length > 0,
      isLoading,
      path: window.location.pathname,
      url: window.location.href
    });
    
    // Log detalhado das soluções para debug
    if (solutions.length > 0) {
      console.log("Primeiras soluções carregadas:", solutions.slice(0, 2));
    }
  }, [solutions, isLoading]);
  
  // Categorizar soluções
  const categorizedSolutions = {
    active: solutions.filter(s => s.published),
    recommended: solutions.filter(s => s.published).slice(0, 3),
    completed: []
  };
  
  const [category, setCategory] = useState<string>(
    searchParams.get("category") || "recommended"
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
    navigate(`/solutions/${solution.id}`);
  }, [navigate, prefetchSolution]);

  // Efeito para mostrar toast na primeira visita - executado apenas 1 vez
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstDashboardVisit") !== "false";
    
    if (isFirstVisit) {
      toast("Bem-vindo ao seu dashboard personalizado!");
      localStorage.setItem("firstDashboardVisit", "false");
    }
    
    // Informar que chegou à página de dashboard
    console.log("Dashboard montado com sucesso. URL atual:", window.location.href);
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

  console.log("Dashboard renderizando com dados carregados");

  return (
    <DashboardLayout
      solutions={categorizedSolutions}
      isLoading={isLoading}
      onCategoryChange={handleCategoryChange}
      onSolutionClick={handleSolutionClick}
      currentCategory={category}
    />
  );
};

export default Dashboard;
