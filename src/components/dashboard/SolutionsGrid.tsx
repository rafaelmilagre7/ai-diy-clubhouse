
import { FC, memo } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionCard } from "./SolutionCard";

interface SolutionsGridProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
}

// Otimização: Usar memo para evitar re-renderizações desnecessárias
export const SolutionsGrid: FC<SolutionsGridProps> = memo(({ 
  solutions, 
  onSolutionClick 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
