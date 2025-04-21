
import { FC } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { ActiveSolutions } from "./ActiveSolutions";
import { CompletedSolutions } from "./CompletedSolutions";
import { RecommendedSolutions } from "./RecommendedSolutions";
import { NoSolutionsPlaceholder } from "./NoSolutionsPlaceholder";
import { Solution } from "@/lib/supabase";

interface DashboardLayoutProps {
  active: Solution[];
  completed: Solution[];
  recommended: Solution[];
  category: string;
  onCategoryChange: (category: string) => void;
  onSolutionClick: (solution: Solution) => void;
}

export const DashboardLayout: FC<DashboardLayoutProps> = ({
  active,
  completed,
  recommended,
  category,
  onCategoryChange,
  onSolutionClick
}) => {
  const hasNoSolutions = active.length === 0 && completed.length === 0 && recommended.length === 0;

  return (
    <div className="space-y-8">
      <DashboardHeader 
        activeSolutionsCount={active.length}
        completedSolutionsCount={completed.length}
        category={category}
        onCategoryChange={onCategoryChange}
      />

      {hasNoSolutions ? (
        <NoSolutionsPlaceholder />
      ) : (
        <>
          {active.length > 0 && (
            <ActiveSolutions 
              solutions={active} 
              onSolutionClick={onSolutionClick} 
            />
          )}
          
          {completed.length > 0 && (
            <CompletedSolutions 
              solutions={completed} 
              onSolutionClick={onSolutionClick} 
            />
          )}
          
          {recommended.length > 0 && (
            <RecommendedSolutions 
              solutions={recommended} 
              onSolutionClick={onSolutionClick} 
            />
          )}
        </>
      )}
    </div>
  );
};
