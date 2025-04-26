
import React from "react";
import { useNavigate } from "react-router-dom";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TrailSolution extends Solution {
  priority: number;
  justification: string;
}

interface TrailSolutionsListProps {
  solutions: TrailSolution[];
  isItemLoading?: boolean; // Adicionado como opcional para compatibilidade
}

export const TrailSolutionsList: React.FC<TrailSolutionsListProps> = ({ 
  solutions,
  isItemLoading = false
}) => {
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

  // Função para obter a cor do badge de prioridade
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-red-100 text-red-800 hover:bg-red-100";
      case 2: return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case 3: return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Função para obter o texto da prioridade
  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 1: return "Alta Prioridade";
      case 2: return "Média Prioridade";
      case 3: return "Para Explorar";
      default: return "Prioridade";
    }
  };

  // Função para navegar para a página de detalhes da solução
  const handleSolutionClick = (id: string) => {
    navigate(`/solution/${id}`);
  };

  return (
    <div className="space-y-8">
      {Object.keys(priorityGroups).map((priorityKey) => {
        const priority = parseInt(priorityKey);
        const prioritySolutions = priorityGroups[priority];
        
        return (
          <div key={`priority-${priority}`} className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getPriorityColor(priority)}>
                {getPriorityText(priority)}
              </Badge>
              {priority === 1 && (
                <span className="text-xs text-gray-500 italic">
                  Recomendado começar por estas soluções
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prioritySolutions.map((solution) => (
                <Card key={solution.id} className="border border-gray-200 hover:border-[#0ABAB5]/30 transition-all">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {isItemLoading ? <Skeleton className="h-6 w-3/4" /> : solution.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {isItemLoading ? <Skeleton className="h-4 w-full" /> : solution.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {isItemLoading ? (
                      <Skeleton className="h-12 w-full mb-2" />
                    ) : (
                      <div className="text-sm text-gray-600 italic mb-2">
                        "{solution.justification}"
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {isItemLoading ? (
                        <>
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-14" />
                        </>
                      ) : (
                        solution.tags?.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button
                      onClick={() => handleSolutionClick(solution.id)}
                      className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
                      disabled={isItemLoading}
                    >
                      {isItemLoading ? (
                        <Skeleton className="h-4 w-24" />
                      ) : (
                        <>
                          Ver Solução
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
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
