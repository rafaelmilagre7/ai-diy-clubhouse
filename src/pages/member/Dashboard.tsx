
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
  
  // Verifica e usa dados em cache para renderização instantânea
  const cachedSolutions = queryClient.getQueryData<Solution[]>(['solutions']);
  
  // Corrigir a chamada de useSolutionsData para atender a assinatura esperada
  const { solutions, loading: solutionsLoading, isFetched } = useSolutionsData(category);
  
  // Otimização: Usar useMemo para o array de soluções para evitar recálculos desnecessários
  const filteredSolutions = useMemo(() => {
    // Usar cache ou dados recém buscados - estratégia de stale-while-revalidate
    const solutionsToUse = solutions && solutions.length > 0 
      ? solutions 
      : (cachedSolutions || []);
      
    if (!solutionsToUse || solutionsToUse.length === 0) return [];
    
    return category !== "general" 
      ? solutionsToUse.filter(s => s.category === category)
      : solutionsToUse;
  }, [solutions, cachedSolutions, category]);
  
  // Usar as soluções filtradas para obter o progresso - com preferência por cache
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

  // Prefetch de dados para transição instantânea
  useEffect(() => {
    // Prefetch dados de solução para navegação instantânea
    const allSolutions = [...(active || []), ...(completed || []), ...(recommended || [])];
    
    allSolutions.forEach(solution => {
      queryClient.prefetchQuery({
        queryKey: ['solution', solution.id],
        staleTime: 1000 * 60 * 5 // 5 minutos
      });
    });
  }, [active, completed, recommended, queryClient]);

  // Função para navegar para a página de detalhes da solução - memoizada e com prefetch
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
    
    if (isFirstVisit && isFetched) {
      // Atrasar ligeiramente o toast para evitar conflito com renderização inicial
      const timeoutId = setTimeout(() => {
        toast("Bem-vindo ao seu dashboard personalizado!");
        localStorage.setItem("firstDashboardVisit", "false");
      }, 1500);
      
      // Limpeza do timeout quando o componente é desmontado
      return () => clearTimeout(timeoutId);
    }
  }, [isFetched]);

  // Sempre renderiza o layout, mesmo durante carregamento
  return (
    <DashboardLayout
      active={active || []}
      completed={completed || []}
      recommended={recommended || []}
      category={category}
      onCategoryChange={handleCategoryChange}
      onSolutionClick={handleSolutionClick}
      isLoading={solutionsLoading || progressLoading}
    />
  );
};

export default Dashboard;
