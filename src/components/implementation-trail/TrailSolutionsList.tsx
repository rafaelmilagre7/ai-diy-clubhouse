import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Solution } from "@/lib/supabase";
import { Clock, ArrowRight } from "lucide-react";

// Define uma interface TrailSolution baseada em Solution
export interface TrailSolution extends Solution {
  status?: string;
  progress?: number;
  next_step?: string;
  is_locked?: boolean;
}

interface TrailSolutionsListProps {
  solutions: TrailSolution[];
  isLoading?: boolean;
  onSelect?: (solutionId: string) => void;
}

export const TrailSolutionsList: React.FC<TrailSolutionsListProps> = ({ solutions, isLoading, onSelect }) => {
  const navigate = useNavigate();
  
  // Agrupar soluções por prioridade
  const priorityGroups = solutions.reduce((acc, solution) => {
    const priority = solution.priority;
    if (!acc[priority]) {
      acc[priority] = [];
    }
    acc[priority].push(solution);
    return acc;
  }, {} as Record<number, TrailSolution[]>);

  // Função para obter a cor e ícone do badge de prioridade
  const getPriorityInfo = (priority: number) => {
    switch (priority) {
      case 1: return { 
        color: "bg-gradient-to-r from-[#0ABAB5]/20 to-[#34D399]/10 text-[#0ABAB5] border-[#0ABAB5]/30", 
        icon: <Sparkles className="h-3.5 w-3.5 mr-1" />,
        text: "Alta Prioridade",
        cardClass: "border-l-[3px] border-l-[#0ABAB5]"
      };
      case 2: return { 
        color: "bg-gradient-to-r from-amber-500/20 to-amber-400/10 text-amber-400 border-amber-500/30", 
        icon: <Gauge className="h-3.5 w-3.5 mr-1" />,
        text: "Média Prioridade",
        cardClass: "border-l-[3px] border-l-amber-500"
      };
      case 3: return { 
        color: "bg-gradient-to-r from-neutral-500/20 to-neutral-400/10 text-neutral-400 border-neutral-500/30", 
        icon: <Zap className="h-3.5 w-3.5 mr-1" />,
        text: "Para Explorar",
        cardClass: "border-l-[3px] border-l-neutral-500"
      };
      default: return { 
        color: "bg-gray-800/50 text-gray-300 border-gray-700/30", 
        icon: null,
        text: "Prioridade",
        cardClass: ""
      };
    }
  };

  // Função para navegar para a página de detalhes da solução
  const handleSolutionClick = (id: string) => {
    navigate(`/solution/${id}`);
  };

  return (
    <div className="space-y-10">
      {Object.keys(priorityGroups).map((priorityKey) => {
        const priority = parseInt(priorityKey);
        const prioritySolutions = priorityGroups[priority];
        const priorityInfo = getPriorityInfo(priority);
        
        return (
          <div key={`priority-${priority}`} className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge 
                variant="outline" 
                className={`px-3 py-1.5 rounded-full flex items-center ${priorityInfo.color}`}
              >
                {priorityInfo.icon}
                {priorityInfo.text}
              </Badge>
              
              {priority === 1 && (
                <span className="text-xs text-[#0ABAB5]/80 italic">
                  Recomendado começar por estas soluções
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {prioritySolutions.map((solution) => (
                <Card 
                  key={solution.id} 
                  className={`border border-white/5 bg-[#151823]/80 hover:bg-[#151823] transition-all hover:-translate-y-1 hover:shadow-lg ${priorityInfo.cardClass}`}
                >
                  <div className="aspect-video w-full relative overflow-hidden">
                    {solution.thumbnail_url ? (
                      <img 
                        src={solution.thumbnail_url} 
                        alt={solution.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1E2E] to-[#151823]">
                        <div className="text-4xl font-bold text-[#0ABAB5]/20">{solution.title.charAt(0)}</div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#151823] to-transparent h-12"></div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-neutral-100">{solution.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{solution.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="text-sm text-neutral-400 italic mb-3 p-3 border-l-2 border-[#0ABAB5]/30 bg-[#0ABAB5]/5 rounded-r-md">
                      "{solution.justification}"
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {solution.estimated_time && (
                        <Badge variant="info" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {solution.estimated_time} min
                        </Badge>
                      )}
                      
                      {solution.difficulty && (
                        <Badge variant="neutral">
                          {solution.difficulty === "easy" && "Fácil"}
                          {solution.difficulty === "medium" && "Médio"}
                          {solution.difficulty === "advanced" && "Avançado"}
                        </Badge>
                      )}
                      
                      {solution.tags?.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button
                      onClick={() => handleSolutionClick(solution.id)}
                      className="w-full bg-gradient-to-r from-[#0ABAB5] to-[#34D399] hover:from-[#0ABAB5]/90 hover:to-[#34D399]/90"
                    >
                      Ver Solução
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
