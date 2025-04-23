
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDashboardProgress } from "@/hooks/useDashboardProgress";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Solution } from "@/lib/supabase";
import LoadingScreen from "@/components/common/LoadingScreen";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Buscar soluções com React Query
  const { 
    data: solutions = [], 
    isLoading: solutionsLoading 
  } = useQuery({
    queryKey: ['dashboardSolutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Solution[];
    },
    staleTime: 5 * 60 * 1000 // 5 minutos de cache
  });
  
  // Usar o hook de progresso
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

  // Efeito para mostrar toast na primeira visita - executado apenas 1 vez
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
