
import { ReactNode } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { DashboardHeader } from "./DashboardHeader";
import { CategoryTabs } from "./CategoryTabs";
import { ProgressSummary } from "./ProgressSummary";

interface DashboardLayoutProps {
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  completedCount: number;
  inProgressCount: number;
  progressPercentage: number;
  totalSolutions: number;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  children: ReactNode;
}

export const DashboardLayout = ({
  loading,
  searchQuery,
  onSearchChange,
  completedCount,
  inProgressCount,
  progressPercentage,
  totalSolutions,
  activeCategory,
  onCategoryChange,
  children
}: DashboardLayoutProps) => {
  if (loading) {
    return <LoadingScreen message="Carregando suas soluções..." />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
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
          onCategoryChange={onCategoryChange}
        >
          {children}
        </CategoryTabs>
      </div>
    </div>
  );
};
