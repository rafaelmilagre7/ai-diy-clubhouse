
import { FC, memo, useCallback } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionCard } from "./SolutionCard";
import { useStableCallback } from "@/hooks/performance/useStableCallback";

interface SolutionsGridProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
}

// Otimização: Usar memo para evitar re-renderizações desnecessárias
export const SolutionsGrid: FC<SolutionsGridProps> = memo(({ 
  solutions, 
  onSolutionClick 
}) => {
  // Estabilizar callback para evitar re-renders dos cards
  const stableOnSolutionClick = useStableCallback(onSolutionClick);

  // Memoizar função de click para cada solução
  const handleSolutionClick = useCallback((solution: Solution) => {
    stableOnSolutionClick(solution);
  }, [stableOnSolutionClick]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {solutions.map((solution) => (
        <SolutionCard
          key={solution.id}
          solution={solution}
          onClick={() => handleSolutionClick(solution)}
        />
      ))}
    </div>
  );
});

SolutionsGrid.displayName = 'SolutionsGrid';
