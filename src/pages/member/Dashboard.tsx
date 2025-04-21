
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { useDashboardProgress } from "@/hooks/useDashboardProgress";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Solution } from "@/lib/supabase";
import { LoadingScreen } from "@/components/common/LoadingScreen";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { solutions, loading: solutionsLoading } = useSolutionsData();
  const { 
    active, 
    completed, 
    recommended, 
    loading: progressLoading 
  } = useDashboardProgress(solutions);
  
  const [category, setCategory] = useState<string>(
    searchParams.get("category") || "general"
  );
  
  // Função para lidar com a mudança de categoria
  const handleCategoryChange = useCallback((newCategory: string) => {
    setCategory(newCategory);
    setSearchParams({ category: newCategory });
  }, [setSearchParams]);

  // Função para navegar para a página de detalhes da solução
  const handleSolutionClick = (solution: Solution) => {
    navigate(`/solution/${solution.id}`);
  };

  // Efeito para mostrar toast na primeira visita
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstDashboardVisit") !== "false";
    
    if (isFirstVisit) {
      toast("Bem-vindo ao seu dashboard personalizado!");
      localStorage.setItem("firstDashboardVisit", "false");
    }
  }, []);

  // Mostrar tela de carregamento enquanto os dados estão sendo carregados
  if (solutionsLoading || progressLoading) {
    return <LoadingScreen message="Carregando seu dashboard..." />;
  }

  return (
    <DashboardLayout
      active={active}
      completed={completed}
      recommended={recommended}
      category={category}
      onCategoryChange={handleCategoryChange}
      onSolutionClick={handleSolutionClick}
    />
  );
};

export default Dashboard;
