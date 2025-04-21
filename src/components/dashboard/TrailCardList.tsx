
import { Button } from "@/components/ui/button";
import { TrailSolutionCard } from "./TrailSolutionCard";
import { Badge } from "@/components/ui/badge";

interface TrailCardListProps {
  solutions: (any & { priority: number; justification: string })[];
  onSolutionClick: (id: string) => void;
  onSeeAll: () => void;
}

export function TrailCardList({ solutions, onSolutionClick, onSeeAll }: TrailCardListProps) {
  // Ordenar soluções por prioridade
  const sortedSolutions = [...solutions].sort((a, b) => a.priority - b.priority);

  // Separar por prioridade
  const priority1 = sortedSolutions.filter(s => s.priority === 1);
  const priority2 = sortedSolutions.filter(s => s.priority === 2);
  const priority3 = sortedSolutions.filter(s => s.priority === 3);

  // Corrigir bug: garantir título sempre visível (fallback)
  const safeGetTitle = (solution: any) => 
    solution.title && typeof solution.title === "string"
      ? solution.title
      : "Solução sem título";

  // Renderizar grupo visual para cada prioridade com divisória moderna
  const renderPriorityGroup = (title: string, solutions: any[], color: string, border?: boolean) => {
    if (solutions.length === 0) return null;

    return (
      <div className={`mb-8`}>
        <div className="flex items-center gap-2 mb-4">
          <Badge className={`${color} text-white font-medium px-3 py-1 rounded-full text-sm shadow`} variant="outline">
            {title}
          </Badge>
          <span className="flex-1 border-t border-[#0ABAB5]/10"></span>
        </div>
        <div className="space-y-4">
          {solutions.map(solution => (
            <TrailSolutionCard
              key={solution.solutionId}
              solution={{ ...solution, title: safeGetTitle(solution) }}
              onClick={onSolutionClick}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {renderPriorityGroup("Alta Prioridade", priority1, "bg-[#0ABAB5]")}
      {renderPriorityGroup("Prioridade Média", priority2, "bg-amber-500")}
      {renderPriorityGroup("Complementar", priority3, "bg-gray-500")}

      <div className="mt-8 text-center">
        <Button
          variant="outline"
          onClick={onSeeAll}
          className="text-[#0ABAB5] border-[#0ABAB5] hover:bg-[#0ABAB5]/10 hover:scale-105 transition-all"
        >
          Ver todas as soluções
        </Button>
      </div>
    </div>
  );
}
