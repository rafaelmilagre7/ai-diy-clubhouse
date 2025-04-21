
import { Solution } from "@/hooks/dashboard/types";
import { SolutionCard } from "./SolutionCard";
import { SolutionsGridLoader } from "./SolutionsGridLoader";

export interface SolutionsGridProps {
  solutions: Solution[];
  onSolutionClick: (id: string) => void;
  category?: string;
  loading?: boolean;
}

export const SolutionsGrid = ({ 
  solutions, 
  onSolutionClick,
  category = "all",
  loading = false
}: SolutionsGridProps) => {
  if (loading) {
    return <SolutionsGridLoader />;
  }

  if (solutions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma solução encontrada nesta categoria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {solutions.map((solution) => (
        <SolutionCard
          key={solution.id}
          solution={solution}
          onClick={() => onSolutionClick(solution.id)}
        />
      ))}
    </div>
  );
};
