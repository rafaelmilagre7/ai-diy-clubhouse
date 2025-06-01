
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight, Star } from "lucide-react";
import { TrailSolutionEnriched } from "@/types/implementation-trail";
import { useNavigate } from "react-router-dom";

interface TrailSolutionsListProps {
  solutions: TrailSolutionEnriched[];
}

export const TrailSolutionsList: React.FC<TrailSolutionsListProps> = ({ solutions }) => {
  const navigate = useNavigate();

  if (!solutions || solutions.length === 0) {
    return (
      <Card className="bg-neutral-800/20 border-neutral-700/50">
        <CardContent className="pt-6">
          <div className="text-center">
            <Lightbulb className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-400">Nenhuma solução recomendada encontrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSolutionClick = (solution: TrailSolutionEnriched) => {
    navigate(`/solution/${solution.id}`);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-viverblue text-white";
      case 2: return "bg-amber-500 text-white";
      case 3: return "bg-neutral-500 text-white";
      default: return "bg-neutral-600 text-white";
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return "Alta Prioridade";
      case 2: return "Prioridade Média";
      case 3: return "Complementar";
      default: return "Recomendado";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'iniciante': return "text-green-400 border-green-400";
      case 'intermediário': return "text-amber-400 border-amber-400";
      case 'avançado': return "text-red-400 border-red-400";
      default: return "text-neutral-400 border-neutral-400";
    }
  };

  // Agrupar por prioridade
  const groupedSolutions = solutions.reduce((acc, solution) => {
    const priority = solution.priority || 1;
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(solution);
    return acc;
  }, {} as Record<number, TrailSolutionEnriched[]>);

  return (
    <div className="space-y-8">
      {[1, 2, 3].map(priority => {
        const prioritySolutions = groupedSolutions[priority];
        if (!prioritySolutions || prioritySolutions.length === 0) return null;

        return (
          <div key={priority} className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className={`${getPriorityColor(priority)} text-sm px-3 py-1`}>
                <Star className="h-3 w-3 mr-1" />
                {getPriorityLabel(priority)}
              </Badge>
              <div className="flex-1 border-t border-viverblue/20"></div>
            </div>

            <div className="grid gap-4">
              {prioritySolutions.map((solution, index) => (
                <Card 
                  key={solution.id} 
                  className="bg-neutral-800/50 border-neutral-700/50 hover:border-viverblue/40 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleSolutionClick(solution)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs border-neutral-600 text-neutral-300">
                            {solution.category}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getDifficultyColor(solution.difficulty)}`}
                          >
                            {solution.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg text-white group-hover:text-viverblue transition-colors">
                          {solution.title}
                        </CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-viverblue transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-neutral-300 text-sm mb-3 line-clamp-2">
                      {solution.description}
                    </p>
                    
                    {solution.justification && (
                      <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-3 mb-4">
                        <p className="text-sm text-viverblue font-medium">
                          🎯 {solution.justification}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {solution.tags && solution.tags.length > 0 && (
                          <div className="flex gap-1">
                            {solution.tags.slice(0, 2).map((tag, tagIndex) => (
                              <Badge 
                                key={tagIndex} 
                                variant="secondary" 
                                className="text-xs bg-neutral-700 text-neutral-300"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {solution.tags.length > 2 && (
                              <Badge 
                                variant="secondary" 
                                className="text-xs bg-neutral-700 text-neutral-300"
                              >
                                +{solution.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="bg-viverblue hover:bg-viverblue/80 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSolutionClick(solution);
                        }}
                      >
                        Ver Solução
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
