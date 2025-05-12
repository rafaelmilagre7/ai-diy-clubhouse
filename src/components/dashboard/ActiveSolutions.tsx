
import { FC } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionsGrid } from "./SolutionsGrid";

interface ActiveSolutionsProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
}

export const ActiveSolutions: FC<ActiveSolutionsProps> = ({ 
  solutions, 
  onSolutionClick 
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Projetos em andamento</h2>
      <p className="text-muted-foreground mb-4">
        Continue implementando esses projetos em seu negócio
      </p>
      <SolutionsGrid solutions={solutions} onSolutionClick={onSolutionClick} />
    </div>
  );
};
