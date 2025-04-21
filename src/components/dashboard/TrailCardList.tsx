
import { Button } from "@/components/ui/button";
import { TrailSolutionCard } from "./TrailSolutionCard";

interface TrailCardListProps {
  solutions: (any & { priority: number; justification: string })[];
  onSolutionClick: (id: string) => void;
  onSeeAll: () => void;
}

export function TrailCardList({ solutions, onSolutionClick, onSeeAll }: TrailCardListProps) {
  // Mostrar apenas as 5 primeiras soluções
  const topSolutions = solutions
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5);

  return (
    <>
      <div className="space-y-4">
        {topSolutions.map((solution) =>
          <TrailSolutionCard
            key={solution.id}
            solution={solution}
            onClick={onSolutionClick}
          />
        )}
      </div>
      <div className="mt-4 text-center">
        <Button
          variant="outline"
          onClick={onSeeAll}
          className="text-[#0ABAB5] border-[#0ABAB5] hover:bg-[#0ABAB5]/10"
        >
          Ver todas as soluções
        </Button>
      </div>
    </>
  );
}
