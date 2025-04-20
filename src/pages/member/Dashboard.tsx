
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { useDashboardProgress } from "@/hooks/useDashboardProgress";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  
  const { 
    activeSolutions, 
    completedSolutions, 
    loading, 
    allSolutions 
  } = useDashboardProgress();
  
  const { 
    filteredSolutions, 
    activeCategory, 
    setActiveCategory 
  } = useSolutionsData(categoryParam);
  
  const completedCount = completedSolutions.length;
  const inProgressCount = activeSolutions.length;
  const totalSolutions = filteredSolutions.length;
  const progressPercentage = totalSolutions > 0 
    ? Math.round((completedCount / totalSolutions) * 100) 
    : 0;
  
  const handleSelectSolution = (id: string) => {
    console.log("Navegando para detalhes da solução:", id);
    toast.success("Carregando solução...");
    navigate(`/solution/${id}`);
  };

  return (
    <DashboardLayout
      loading={loading}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      completedCount={completedCount}
      inProgressCount={inProgressCount}
      progressPercentage={progressPercentage}
      totalSolutions={totalSolutions}
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
      filteredSolutions={filteredSolutions}
      onSelectSolution={handleSelectSolution}
    />
  );
};

export default Dashboard;
