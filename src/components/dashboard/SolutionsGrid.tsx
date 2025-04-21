
import { FC } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionCard } from "./SolutionCard";

interface SolutionsGridProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
}

export const SolutionsGrid: FC<SolutionsGridProps> = ({ 
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
};
