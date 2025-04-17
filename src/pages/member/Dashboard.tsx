
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useState } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CategoryTabs } from "@/components/dashboard/CategoryTabs";
import { ProgressSummary } from "@/components/dashboard/ProgressSummary";
import { useDashboardProgress } from "@/hooks/useDashboardProgress";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

const Dashboard = () => {
  const { profile } = useAuth();
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
  
  if (loading) {
    return <LoadingScreen message="Carregando suas soluções..." />;
  }
  
  return (
    <div className="space-y-6">
      <DashboardHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <ProgressSummary 
        completedCount={completedCount}
        inProgressCount={inProgressCount}
        progressPercentage={progressPercentage}
        totalSolutions={totalSolutions}
      />
      
      <div className="space-y-4">
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          filteredSolutions={filteredSolutions}
          onSelectSolution={handleSelectSolution}
        />
      </div>
    </div>
  );
};

export default Dashboard;
