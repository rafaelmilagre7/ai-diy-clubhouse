
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Solution } from "@/types/solution";
import { ArrowRight, Lightbulb, Clock } from "lucide-react";

interface TrailPanelSolutionsProps {
  solutions: (Solution & { priority: number; justification: string })[];
}

export const TrailPanelSolutions: React.FC<TrailPanelSolutionsProps> = ({ solutions }) => {
  const navigate = useNavigate();
  
  if (!solutions || solutions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-neutral-400">Nenhuma solução encontrada em sua trilha.</p>
      </div>
    );
  }

  // Agrupar por prioridade
  const byPriority: Record<number, typeof solutions> = {};
  solutions.forEach(solution => {
    if (!byPriority[solution.priority]) {
      byPriority[solution.priority] = [];
    }
    byPriority[solution.priority].push(solution);
  });
  
  const priorityLabels: Record<number, string> = {
    1: "Alta Prioridade",
    2: "Média Prioridade", 
    3: "Baixa Prioridade"
  };

  return (
    <div className="space-y-6">
      {Object.keys(byPriority).map((priority) => (
        <div key={priority} className="space-y-4">
          <h4 className="text-white text-sm font-medium flex items-center gap-2">
            <Badge 
              className={`
                ${Number(priority) === 1 ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 
                 Number(priority) === 2 ? 'bg-orange-600/20 text-orange-400 hover:bg-orange-600/30' : 
                 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'}
              `}
            >
              {priorityLabels[Number(priority)]}
            </Badge>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {byPriority[Number(priority)].map(solution => (
              <Card key={solution.id} className="bg-[#151823] border-neutral-700/50 hover:border-[#0ABAB5]/60 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5] border-[#0ABAB5]/30">
                      {solution.category}
                    </Badge>
                    <Badge variant="outline" className="bg-[#151823]">
                      {solution.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{solution.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{solution.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="text-sm text-neutral-300 bg-[#0ABAB5]/5 p-3 rounded-md border border-[#0ABAB5]/20">
                    <p className="italic">"{solution.justification}"</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-neutral-400">
                    <Clock size={14} />
                    <span>{solution.estimated_time || 30} minutos estimados</span>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={() => navigate(`/solution/${solution.id}`)}
                    className="w-full bg-[#0ABAB5]/20 hover:bg-[#0ABAB5]/40 text-white border-none"
                  >
                    Implementar <ArrowRight size={16} className="ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
