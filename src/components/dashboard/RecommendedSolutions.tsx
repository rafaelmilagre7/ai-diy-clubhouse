
import { FC } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionsGrid } from "./SolutionsGrid";

interface RecommendedSolutionsProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
}

export const RecommendedSolutions: FC<RecommendedSolutionsProps> = ({ 
  solutions, 
  onSolutionClick 
}) => {
  // Limitar a 6 soluções recomendadas no dashboard
  const limitedSolutions = solutions.slice(0, 6);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-heading font-bold mb-4 text-foreground">Soluções recomendadas</h2>
      <p className="text-muted-foreground mb-4">
        Soluções personalizadas para o seu negócio
      </p>
      <SolutionsGrid solutions={limitedSolutions} onSolutionClick={onSolutionClick} />
    </div>
  );
};
