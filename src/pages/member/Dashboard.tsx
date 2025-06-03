
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { useDashboardProgress } from "@/hooks/dashboard/useDashboardProgress";
import { useOptimizedAuth } from "@/hooks/auth/useOptimizedAuth";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Solution } from "@/lib/supabase";

const Dashboard = () => {
  console.log("📊 Dashboard: Componente iniciando");
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useOptimizedAuth();
  
  console.log("🔐 Dashboard: Estado de auth", { user: !!user, isAuthenticated, authLoading });
  
  // Estado local otimizado
  const [category, setCategory] = useState<string>(() => {
    const categoryFromUrl = searchParams.get("category") || "general";
    console.log("📂 Dashboard: Categoria inicial", categoryFromUrl);
    return categoryFromUrl;
  });
  
  // Hooks de dados
  const { solutions, loading: solutionsLoading, error: solutionsError } = useDashboardData();
  console.log("💾 Dashboard: Dados das soluções", { 
    solutionsCount: solutions?.length || 0, 
    loading: solutionsLoading, 
    error: !!solutionsError 
  });
  
  // Filtrar soluções de forma otimizada
  const filteredSolutions = useMemo(() => {
    if (!solutions?.length) {
      console.log("🔍 Dashboard: Sem soluções para filtrar");
      return [];
    }
    const filtered = category !== "general" 
      ? solutions.filter(s => s.category === category)
      : solutions;
    console.log("🔍 Dashboard: Soluções filtradas", { category, count: filtered.length });
    return filtered;
  }, [solutions, category]);
  
  const { 
    active, 
    completed, 
    recommended, 
    loading: progressLoading,
    error: progressError
  } = useDashboardProgress(filteredSolutions);
  
  console.log("📈 Dashboard: Progresso", {
    active: active?.length || 0,
    completed: completed?.length || 0,
    recommended: recommended?.length || 0,
    loading: progressLoading,
    error: !!progressError
  });
  
  // Verificação de autenticação
  useEffect(() => {
    console.log("🔄 Dashboard: Verificando autenticação", { authLoading, isAuthenticated });
    if (!authLoading && !isAuthenticated) {
      console.log("❌ Dashboard: Redirecionando para login");
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  // Handlers memoizados
  const handleCategoryChange = useCallback((newCategory: string) => {
    console.log("📂 Dashboard: Mudança de categoria", { from: category, to: newCategory });
    setCategory(newCategory);
    setSearchParams({ category: newCategory });
  }, [setSearchParams]);

  const handleSolutionClick = useCallback((solution: Solution) => {
    console.log("🎯 Dashboard: Clique na solução", solution.id);
    navigate(`/solution/${solution.id}`);
  }, [navigate]);
  
  // Toast de boas-vindas
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstDashboardVisit") !== "false";
    
    if (isFirstVisit && isAuthenticated && !authLoading) {
      console.log("👋 Dashboard: Primeira visita, mostrando toast");
      const timeoutId = setTimeout(() => {
        toast("Bem-vindo ao seu dashboard personalizado!");
        localStorage.setItem("firstDashboardVisit", "false");
      }, 1500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, authLoading]);
  
  // Estado de carregamento geral
  const isLoading = authLoading || solutionsLoading || progressLoading;
  console.log("⚡ Dashboard: Estado final", { isLoading, hasError: !!(solutionsError || progressError) });

  console.log("🎨 Dashboard: Renderizando DashboardLayout");
  return (
    <DashboardLayout
      active={active}
      completed={completed}
      recommended={recommended}
      category={category}
      onCategoryChange={handleCategoryChange}
      onSolutionClick={handleSolutionClick}
      isLoading={isLoading}
    />
  );
};

export default Dashboard;
