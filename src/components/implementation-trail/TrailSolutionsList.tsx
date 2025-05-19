
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

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

  const renderPriorityGroup = (title: string, items: any[], badgeClass: string, description: string) => {
    if (items.length === 0) return null;
    
    return (
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className={badgeClass}>
            {title}
          </Badge>
          <div className="h-px flex-1 bg-neutral-800"></div>
        </div>
        
        <p className="text-sm text-neutral-400 mb-4">{description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(solution => (
            <Card key={solution.id} 
              className="bg-[#151823] border-[#0ABAB5]/30 hover:border-[#0ABAB5]/60 transition-all cursor-pointer overflow-hidden"
              onClick={() => navigate(`/solution/${solution.id}`)}
            >
              <div className="flex flex-col h-full">
                {/* Imagem da solução (formato 16:9 horizontal) */}
                <div className="w-full aspect-video relative">
                  {solution.thumbnail_url ? (
                    <img 
                      src={solution.thumbnail_url} 
                      alt={solution.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#0ABAB5]/30 to-[#0ABAB5]/5 flex items-center justify-center">
                      <span className="text-2xl font-semibold text-[#0ABAB5]">{solution.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                
                {/* Conteúdo da solução */}
                <CardContent className="py-4 px-4 flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5] border-[#0ABAB5]/30">
                        {solution.category}
                      </Badge>
                      <Badge variant="outline" className="bg-neutral-800/50 text-neutral-400">
                        {solution.difficulty}
                      </Badge>
                    </div>
                    
                    <h5 className="font-medium text-white mb-2 line-clamp-1">{solution.title}</h5>
                    <p className="text-sm text-neutral-400 line-clamp-2 mb-3">{solution.description}</p>
                  </div>
                  
                  <div className="text-xs text-neutral-300 bg-[#0ABAB5]/5 p-2 rounded border border-[#0ABAB5]/20">
                    <p className="italic line-clamp-2">"{solution.justification || 'Recomendado com base no seu perfil'}"</p>
                    <div className="flex justify-end mt-1">
                      <ArrowUpRight className="h-3 w-3 text-[#0ABAB5]" />
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderPriorityGroup(
        "Prioridade Alta", 
        priority1, 
        "bg-[#0ABAB5]/20 text-[#0ABAB5] border-[#0ABAB5]/30",
        "Estas soluções foram selecionadas como prioridade máxima para seu perfil e objetivos de negócio."
      )}
      {renderPriorityGroup(
        "Prioridade Média", 
        priority2, 
        "bg-amber-500/20 text-amber-500 border-amber-500/30",
        "Depois de implementar as soluções prioritárias, estas podem trazer bons resultados para seu negócio."
      )}
      {renderPriorityGroup(
        "Complementar", 
        priority3, 
        "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
        "Soluções adicionais que podem complementar sua estratégia de implementação de IA."
      )}
    </div>
  );
};
