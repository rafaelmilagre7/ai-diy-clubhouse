
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { useDashboardProgress } from "@/hooks/dashboard/useDashboardProgress";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Solution } from "@/lib/supabase";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Otimização: Usar useMemo para lembrar o valor da categoria entre renderizações
  const initialCategory = useMemo(() => searchParams.get("category") || "general", [searchParams]);
  const [category, setCategory] = useState<string>(initialCategory);
  
  // Logging para debug
  console.log("Dashboard: Renderizando componente");
  
  // Carregar soluções com melhor tratamento de erro
  const { solutions, loading: solutionsLoading, error: solutionsError } = useSolutionsData();
  
  console.log(`Dashboard: ${solutions.length} soluções carregadas, loading=${solutionsLoading}, error=${solutionsError}`);
  
  // Otimização: Usar useMemo para o array de soluções para evitar recálculos desnecessários
  const filteredSolutions = useMemo(() => {
    if (!solutions || solutions.length === 0) {
      console.log("Dashboard: Nenhuma solução disponível para filtrar");
      return [];
    }
    
    console.log(`Dashboard: Filtrando ${solutions.length} soluções por categoria ${category}`);
    
    return category !== "general" 
      ? solutions.filter(s => s.category === category)
      : solutions;
  }, [solutions, category]);
  
  console.log(`Dashboard: ${filteredSolutions.length} soluções filtradas por categoria`);
  
  // Usar as soluções filtradas para obter o progresso
  const { 
    active, 
    completed, 
    recommended, 
    loading: progressLoading,
    error: progressError
  } = useDashboardProgress(filteredSolutions);
  
  console.log(`Dashboard: Progresso carregado - ${active.length} ativas, ${completed.length} completas, ${recommended.length} recomendadas, loading=${progressLoading}, error=${progressError}`);
  
  // Função para lidar com a mudança de categoria - memoizada para evitar recriação
  const handleCategoryChange = useCallback((newCategory: string) => {
    console.log(`Dashboard: Mudando categoria para ${newCategory}`);
    setCategory(newCategory);
    setSearchParams({ category: newCategory });
  }, [setSearchParams]);

  // Função para navegar para a página de detalhes da solução - memoizada
  const handleSolutionClick = useCallback((solution: Solution) => {
    console.log(`Dashboard: Navegando para solução ${solution.id}`);
    navigate(`/solution/${solution.id}`);
  }, [navigate]);

  // Controle para exibir toast apenas na primeira visita usando localStorage
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstDashboardVisit") !== "false";
    
    if (isFirstVisit) {
      // Atrasar ligeiramente o toast para evitar conflito com renderização inicial
      const timeoutId = setTimeout(() => {
        toast("Bem-vindo ao seu dashboard personalizado!");
        localStorage.setItem("firstDashboardVisit", "false");
      }, 1500);
      
      // Limpeza do timeout quando o componente é desmontado
      return () => clearTimeout(timeoutId);
    }
  }, []);

  // Mostrar erros de carregamento ao usuário
  useEffect(() => {
    if (solutionsError) {
      console.error("Dashboard: Erro ao carregar soluções:", solutionsError);
      toast("Erro ao carregar soluções. Tente recarregar a página.");
    }
    
    if (progressError) {
      console.error("Dashboard: Erro ao carregar progresso:", progressError);
      toast("Erro ao carregar seu progresso. Tente recarregar a página.");
    }
  }, [solutionsError, progressError]);

  // Renderizar o layout diretamente, sem usar um componente de carregamento bloqueante
  return (
    <DashboardLayout
      active={active}
      completed={completed}
      recommended={recommended}
      category={category}
      onCategoryChange={handleCategoryChange}
      onSolutionClick={handleSolutionClick}
      isLoading={solutionsLoading || progressLoading}
    />
  );
};

export default Dashboard;
