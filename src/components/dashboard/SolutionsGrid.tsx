
import { FC, memo } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionCard } from "./SolutionCard";

interface SolutionsGridProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
  variant?: 'default' | 'compact' | 'featured';
  columns?: 1 | 2 | 3 | 4;
}

export const SolutionsGrid: FC<SolutionsGridProps> = memo(({ 
  solutions, 
  onSolutionClick,
  variant = 'default',
  columns = 3
}) => {
  const getGridClasses = () => {
    const baseClasses = "grid gap-6 animate-fade-in";
    switch (columns) {
      case 1:
        return `${baseClasses} grid-cols-1`;
      case 2:
        return `${baseClasses} grid-cols-1 lg:grid-cols-2`;
      case 4:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`;
      default:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
    }
  };

  return (
    <div className={getGridClasses()}>
      {solutions.map((solution) => (
        <SolutionCard
          key={solution.id}
          solution={solution}
          onClick={() => onSolutionClick(solution)}
          variant={variant}
        />
      ))}
    </div>
  );
});

SolutionsGrid.displayName = 'SolutionsGrid';
