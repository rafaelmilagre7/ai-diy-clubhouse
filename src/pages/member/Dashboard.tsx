
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useState, useEffect } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CategoryTabs } from "@/components/dashboard/CategoryTabs";
import { ProgressSummary } from "@/components/dashboard/ProgressSummary";
import { useDashboardProgress } from "@/hooks/useDashboardProgress";

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  
  // Use custom hooks for data fetching and state management
  const [searchQuery, setSearchQuery] = useState("");
  const { loading, userProgress, completedCount, inProgressCount, progressPercentage } = useDashboardProgress();
  const { 
    filteredSolutions, 
    activeCategory, 
    setActiveCategory 
  } = useSolutionsData(categoryParam);
  
  const handleSelectSolution = (id: string) => {
    console.log("Navigating to solution detail:", id);
    navigate(`/solution/${id}`);
  };
  
  if (loading) {
    return <LoadingScreen message="Carregando suas soluções..." />;
  }
  
  return (
    <div className="space-y-6">
      {/* Welcome section with header */}
      <DashboardHeader 
        profileName={profile?.name}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Progress summary cards */}
      <ProgressSummary 
        completedCount={completedCount}
        inProgressCount={inProgressCount}
        progressPercentage={progressPercentage}
        totalSolutions={filteredSolutions.length}
      />
      
      {/* Category tabs and solutions grid */}
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
