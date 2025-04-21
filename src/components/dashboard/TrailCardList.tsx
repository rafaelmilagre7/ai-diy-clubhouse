
import { Button } from "@/components/ui/button";
import { TrailSolutionCard } from "./TrailSolutionCard";
import { Badge } from "@/components/ui/badge";

interface TrailCardListProps {
  solutions: (any & { priority: number; justification: string })[];
  onSolutionClick: (id: string) => void;
  onSeeAll: () => void;
}

export function TrailCardList({ solutions, onSolutionClick, onSeeAll }: TrailCardListProps) {
  // Verificar se temos soluções
  if (!solutions || solutions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Nenhuma solução encontrada em sua trilha.</p>
        <Button 
          onClick={onSeeAll}
          variant="outline"
          className="mt-4"
        >
          Ver todas as soluções disponíveis
        </Button>
      </div>
    );
  }

  // Ordenar soluções por prioridade
  const sortedSolutions = [...solutions].sort((a, b) => a.priority - b.priority);

  // Separar por prioridade
  const priority1 = sortedSolutions.filter(s => s.priority === 1);
  const priority2 = sortedSolutions.filter(s => s.priority === 2);
  const priority3 = sortedSolutions.filter(s => s.priority === 3);

  // Renderizar grupo visual para cada prioridade
  const renderPriorityGroup = (title: string, solutions: any[], color: string) => {
    if (solutions.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge className={`${color} text-white font-medium px-3 py-1 rounded-full text-sm`} variant="outline">
            {title}
          </Badge>
          <span className="flex-1 border-t border-[#0ABAB5]/10"></span>
        </div>
        <div className="space-y-4">
          {solutions.map(solution => (
            <TrailSolutionCard
              key={solution.solutionId}
              solution={solution}
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
          className="text-[#0ABAB5] border-[#0ABAB5] hover:bg-[#0ABAB5]/10"
        >
          Ver todas as soluções
        </Button>
      </div>
    </div>
  );
}
