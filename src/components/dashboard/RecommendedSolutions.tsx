
import { FC, memo } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionsGrid } from "./SolutionsGrid";

interface RecommendedSolutionsProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
}

// Componente 100% memoizado para evitar re-renders desnecessários
export const RecommendedSolutions: FC<RecommendedSolutionsProps> = memo({ 
  solutions, 
  onSolutionClick 
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Soluções recomendadas</h2>
      <p className="text-muted-foreground mb-4">
        Soluções personalizadas para o seu negócio
      </p>
      <SolutionsGrid solutions={solutions} onSolutionClick={onSolutionClick} />
    </div>
  );
});

RecommendedSolutions.displayName = 'RecommendedSolutions';
