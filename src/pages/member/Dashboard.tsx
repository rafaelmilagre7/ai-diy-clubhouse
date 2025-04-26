
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { useDashboardProgress } from "@/hooks/useDashboardProgress";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Solution } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  // Otimização: Usar useMemo para lembrar o valor da categoria entre renderizações
  const initialCategory = useMemo(() => searchParams.get("category") || "general", []);
  const [category, setCategory] = useState<string>(initialCategory);
  
  // Corrigir a chamada de useSolutionsData para atender a assinatura esperada
  const { solutions, loading: solutionsLoading } = useSolutionsData(category);
  
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
    // Pré-fetch dos dados da solução para melhorar UX
    queryClient.prefetchQuery({
      queryKey: ['solution', solution.id],
      staleTime: 1000 * 60 * 5 // 5 minutos
    });
    navigate(`/solution/${solution.id}`);
  }, [navigate, queryClient]);

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
