
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Solution } from "@/lib/supabase";
import { PerformanceOptimizedDashboard } from "@/components/dashboard/PerformanceOptimizedDashboard";
import { useOptimizedDashboard } from "@/hooks/dashboard/useOptimizedDashboard";
import { useStableCallback } from "@/hooks/performance/useStableCallback";

const Dashboard = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  
  // Hook otimizado que integra todos os dados e preload
  const {
    active,
    completed,
    recommended,
    isLoading
  } = useOptimizedDashboard();

  // Callbacks estáveis para evitar re-renders
  const handleSolutionClick = useStableCallback((solution: Solution) => {
    navigate(`/solution/${solution.id}`);
  });

  const handleCategoryChange = useCallback((newCategory: string) => {
    setCategory(newCategory);
  }, []);

  return (
    <PerformanceOptimizedDashboard
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
