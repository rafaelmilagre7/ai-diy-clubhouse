
import { Solution } from "@/lib/supabase";
import { SolutionCard } from "./SolutionCard";

interface SolutionsGridProps {
  solutions: Solution[];
  onSelectSolution: (id: string) => void;
}

export const SolutionsGrid = ({ solutions, onSelectSolution }: SolutionsGridProps) => {
  if (solutions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Nenhuma solução encontrada</h3>
        <p className="text-muted-foreground mt-1">
          Tente mudar os filtros ou a busca para encontrar outras soluções
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {solutions.map((solution) => (
        <SolutionCard
          key={solution.id}
          solution={solution}
          onSelect={onSelectSolution}
        />
      ))}
    </div>
  );
};
