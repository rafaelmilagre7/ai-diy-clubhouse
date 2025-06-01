
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Zap } from "lucide-react";
import { TrailSolutionEnriched } from "@/types/implementation-trail";
import { useNavigate } from "react-router-dom";

interface TrailSolutionsListProps {
  solutions: TrailSolutionEnriched[];
}

const getPriorityInfo = (priority: number) => {
  switch (priority) {
    case 1:
      return {
        label: "Prioridade Alta",
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: <Zap className="h-3 w-3" />
      };
    case 2:
      return {
        label: "Prioridade Média",
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: <Star className="h-3 w-3" />
      };
    case 3:
      return {
        label: "Prioridade Baixa",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: <ArrowRight className="h-3 w-3" />
      };
    default:
      return {
        label: "Normal",
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        icon: <ArrowRight className="h-3 w-3" />
      };
  }
};

export const TrailSolutionsList: React.FC<TrailSolutionsListProps> = ({ solutions }) => {
  const navigate = useNavigate();

  if (!solutions || solutions.length === 0) {
    return (
      <Card className="bg-neutral-900/50 border-neutral-700/50">
        <CardContent className="py-8 text-center">
          <p className="text-neutral-400">Nenhuma solução encontrada na trilha</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {solutions.map((solution) => {
        const priorityInfo = getPriorityInfo(solution.priority);
        
        return (
          <Card 
            key={solution.id} 
            className="bg-neutral-900/50 border-neutral-700/50 hover:border-viverblue/30 transition-all duration-200 cursor-pointer group"
            onClick={() => navigate(`/solution/${solution.id}`)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg font-semibold text-white group-hover:text-viverblue transition-colors">
                  {solution.title}
                </CardTitle>
                <Badge className={`text-xs ${priorityInfo.color} flex items-center gap-1`}>
                  {priorityInfo.icon}
                  P{solution.priority}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Thumbnail da solução */}
              {solution.thumbnail_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-neutral-800">
                  <img 
                    src={solution.thumbnail_url} 
                    alt={solution.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Descrição */}
              <p className="text-sm text-neutral-400 line-clamp-3">
                {solution.description}
              </p>
              
              {/* Justificativa da IA */}
              {solution.justification && (
                <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-3">
                  <p className="text-xs text-viverblue font-medium mb-1">
                    💡 Recomendação Personalizada:
                  </p>
                  <p className="text-xs text-neutral-300">
                    {solution.justification}
                  </p>
                </div>
              )}
              
              {/* Badges de categoria e dificuldade */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs border-neutral-600 text-neutral-300">
                  {solution.category}
                </Badge>
                <Badge variant="outline" className="text-xs border-neutral-600 text-neutral-300">
                  {solution.difficulty}
                </Badge>
              </div>
              
              {/* Botão de ação */}
              <Button 
                className="w-full bg-viverblue hover:bg-viverblue/90 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/solution/${solution.id}`);
                }}
              >
                Ver Solução
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
