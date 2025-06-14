
import { FC, memo } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionsGrid } from "./SolutionsGrid";

interface CompletedSolutionsProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
}

// Componente 100% memoizado para evitar re-renders desnecessários
export const CompletedSolutions: FC<CompletedSolutionsProps> = memo(({ 
  solutions, 
  onSolutionClick 
}) => {
  return (
    <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <h2 className="text-2xl font-bold mb-2 text-white">Implementações concluídas</h2>
      <p className="text-neutral-400 mb-6">
        Projetos que você já implementou com sucesso
      </p>
      <SolutionsGrid solutions={solutions} onSolutionClick={onSolutionClick} />
    </div>
  );
});

CompletedSolutions.displayName = 'CompletedSolutions';
