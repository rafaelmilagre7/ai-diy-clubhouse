
import { FC, memo } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionsGrid } from "./SolutionsGrid";

interface ActiveSolutionsProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
}

// Componente 100% memoizado para evitar re-renders desnecessários
export const ActiveSolutions: FC<ActiveSolutionsProps> = memo(({ 
  solutions, 
  onSolutionClick 
}) => {
  return (
    <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h2 className="text-2xl font-bold mb-2 text-white">Projetos em andamento</h2>
      <p className="text-neutral-400 mb-6">
        Continue implementando esses projetos em seu negócio
      </p>
      <SolutionsGrid solutions={solutions} onSolutionClick={onSolutionClick} />
    </div>
  );
});

ActiveSolutions.displayName = 'ActiveSolutions';
