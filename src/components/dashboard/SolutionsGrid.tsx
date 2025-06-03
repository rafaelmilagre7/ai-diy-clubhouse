
import { FC, memo } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionCard } from "./SolutionCard";

interface SolutionsGridProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
}

export const SolutionsGrid: FC<SolutionsGridProps> = memo(({ 
  solutions, 
  onSolutionClick 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 animate-fade-in">
      {solutions.map((solution) => (
        <SolutionCard
          key={solution.id}
          solution={solution}
          onClick={() => onSolutionClick(solution)}
        />
      ))}
    </div>
  );
});

SolutionsGrid.displayName = 'SolutionsGrid';
