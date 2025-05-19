
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronRight } from "lucide-react";

interface TrailSolutionsListProps {
  solutions: any[];
}

export const TrailSolutionsList: React.FC<TrailSolutionsListProps> = ({ solutions }) => {
  const navigate = useNavigate();

  if (!solutions || solutions.length === 0) {
    return (
      <div className="text-center py-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50 p-4">
        <p className="text-neutral-400">Nenhuma solução encontrada na sua trilha.</p>
      </div>
    );
  }

  // Ordenar soluções por prioridade
  const sortedSolutions = [...solutions].sort((a, b) => (a.priority || 1) - (b.priority || 1));
  
  // Agrupar por prioridade
  const priority1 = sortedSolutions.filter(s => s.priority === 1);
  const priority2 = sortedSolutions.filter(s => s.priority === 2);
  const priority3 = sortedSolutions.filter(s => s.priority === 3);

  const renderPriorityGroup = (title: string, items: any[], badgeClass: string) => {
    if (items.length === 0) return null;
    
    return (
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Badge variant="outline" className={badgeClass}>
            {title}
          </Badge>
        </h4>
        <div className="space-y-3">
          {items.map(solution => (
            <Card key={solution.id} 
              className="bg-[#151823] border-[#0ABAB5]/30 hover:border-[#0ABAB5]/60 transition-all cursor-pointer"
              onClick={() => navigate(`/solution/${solution.id}`)}
            >
              <CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-white mb-1">{solution.title}</h5>
                    <p className="text-sm text-neutral-400 line-clamp-2">{solution.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#0ABAB5]" />
                </div>
                
                <div className="mt-3 text-xs text-neutral-300 bg-[#0ABAB5]/5 p-2 rounded border border-[#0ABAB5]/20">
                  <p className="italic">"{solution.justification || 'Recomendado com base no seu perfil'}"</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderPriorityGroup("Prioridade Alta", priority1, "bg-[#0ABAB5]/20 text-[#0ABAB5] border-[#0ABAB5]/30")}
      {renderPriorityGroup("Prioridade Média", priority2, "bg-amber-500/20 text-amber-500 border-amber-500/30")}
      {renderPriorityGroup("Complementar", priority3, "bg-neutral-500/20 text-neutral-400 border-neutral-500/30")}
    </div>
  );
};
