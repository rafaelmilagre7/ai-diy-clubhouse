
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { useDashboardProgress } from "@/hooks/useDashboardProgress";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Solution } from "@/lib/supabase";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "general";
  const [category, setCategory] = useState<string>(initialCategory);
  
  // Versão simplificada sem cache agressivo
  const { solutions, loading: solutionsLoading } = useSolutionsData(category);
  const { active, completed, recommended, loading: progressLoading } = useDashboardProgress(solutions);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setSearchParams({ category: newCategory });
  };

  const handleSolutionClick = (solution: Solution) => {
    navigate(`/solution/${solution.id}`);
  };

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
