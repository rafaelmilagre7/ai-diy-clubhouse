
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { useDashboardProgress } from "@/hooks/useDashboardProgress";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Solution } from "@/lib/supabase";
import LoadingScreen from "@/components/common/LoadingScreen";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Otimização: Usar useMemo para lembrar o valor da categoria entre renderizações
  const initialCategory = useMemo(() => searchParams.get("category") || "general", []);
  const [category, setCategory] = useState<string>(initialCategory);
  
  // Otimização: Adicionar configuração de staleTime mais longa para reduzir requisições
  const { solutions, loading: solutionsLoading } = useSolutionsData();
  
  // Otimização: Usar useMemo para o array de soluções para evitar recálculos desnecessários
  const filteredSolutions = useMemo(() => {
    if (!solutions || solutions.length === 0) return [];
    return category !== "general" 
      ? solutions.filter(s => s.category === category)
      : solutions;
  }, [solutions, category]);
  
  // Usar as soluções filtradas para obter o progresso
  const { 
    active, 
    completed, 
    recommended, 
    loading: progressLoading 
  } = useDashboardProgress(filteredSolutions);
  
  // Função para lidar com a mudança de categoria - memoizada para evitar recriação
  const handleCategoryChange = useCallback((newCategory: string) => {
    setCategory(newCategory);
    setSearchParams({ category: newCategory });
  }, [setSearchParams]);

  // Função para navegar para a página de detalhes da solução - memoizada
  const handleSolutionClick = useCallback((solution: Solution) => {
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

  // Mostrar tela de carregamento enquanto os dados são carregados
  // Otimização: Usado uma versão memoizada para evitar recriação do componente
  const loadingComponent = useMemo(() => {
    if (solutionsLoading || progressLoading) {
      return <LoadingScreen message="Carregando seu dashboard..." />;
    }
    return null;
  }, [solutionsLoading, progressLoading]);
  
  if (loadingComponent) return loadingComponent;

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
