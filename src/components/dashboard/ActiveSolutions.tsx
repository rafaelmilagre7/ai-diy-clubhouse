
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
  // Limitar a exibição para no máximo 6 projetos
  const limitedSolutions = solutions.slice(0, 6);
  
  return (
    <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h2 className="text-2xl font-heading font-bold mb-2 text-foreground">Projetos em andamento</h2>
      <p className="text-muted-foreground mb-6">
        Continue implementando esses projetos em seu negócio
      </p>
      <SolutionsGrid solutions={limitedSolutions} onSolutionClick={onSolutionClick} />
    </div>
  );
};
