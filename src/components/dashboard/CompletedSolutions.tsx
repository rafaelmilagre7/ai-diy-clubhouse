
import { FC } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionsGrid } from "./SolutionsGrid";

interface CompletedSolutionsProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
}

export const CompletedSolutions: FC<CompletedSolutionsProps> = ({ 
  solutions, 
  onSolutionClick 
}) => {
  return (
    <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <h2 className="text-2xl font-heading font-bold mb-2 text-foreground">Implementações concluídas</h2>
      <p className="text-muted-foreground mb-6">
        Projetos que você já implementou com sucesso
      </p>
      <SolutionsGrid solutions={solutions} onSolutionClick={onSolutionClick} />
    </div>
  );
};
