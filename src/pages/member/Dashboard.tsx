
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { useCentralDataStore } from "@/hooks/useCentralDataStore";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Solution } from "@/lib/supabase";
import { LoadingPage } from "@/components/ui/loading-states";
import { useAuth } from "@/contexts/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuth();
  
  // Debug extensivo para problemas de carregamento
  console.log("Dashboard de membro começou a renderizar - Caminho atual:", window.location.pathname);
  console.log("URL completa:", window.location.href);
  console.log("Usuário autenticado:", !!user);
  console.log("Perfil de usuário:", !!profile);
  console.log("Search params:", Object.fromEntries([...searchParams]));
  
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
      user: !!user,
      profile: !!profile,
      path: window.location.pathname,
      url: window.location.href
    });
    
    // Log detalhado das soluções para debug
    if (solutions.length > 0) {
      console.log("Primeiras soluções carregadas:", solutions.slice(0, 2));
    }
  }, [solutions, isLoading, user, profile]);
  
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
    console.log("Dashboard montado. Verificando estado atual:");
    console.log("- Usuário logado:", !!user);
    console.log("- Perfil carregado:", !!profile);
    console.log("- URL atual:", window.location.href);
    
    const isFirstVisit = localStorage.getItem("firstDashboardVisit") !== "false";
    
    if (isFirstVisit) {
      toast("Bem-vindo ao seu dashboard personalizado!");
      localStorage.setItem("firstDashboardVisit", "false");
    }
  }, [user, profile]);

  // Mostrar tela de carregamento enquanto os dados estão sendo carregados
  if (isLoading) {
    console.log("Dashboard renderizando tela de carregamento...");
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
