
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
      <h2 className="text-2xl font-bold mb-2 text-white text-left">Implementações concluídas</h2>
      <p className="text-neutral-400 mb-6 text-left">
        Projetos que você já implementou com sucesso
      </p>
      <SolutionsGrid solutions={solutions} onSolutionClick={onSolutionClick} />
    </div>
  );
};
