
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { TrailSolutionEnriched } from "@/types/implementation-trail";
import { Star, ArrowRight, Target } from "lucide-react";

interface TrailSolutionsListProps {
  solutions: TrailSolutionEnriched[];
}

export const TrailSolutionsList: React.FC<TrailSolutionsListProps> = ({ solutions }) => {
  const navigate = useNavigate();

  if (!solutions || solutions.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400">
        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Nenhuma solução encontrada na trilha</p>
      </div>
    );
  }

  const groupedSolutions = {
    priority1: solutions.filter(s => s.priority === 1),
    priority2: solutions.filter(s => s.priority === 2),
    priority3: solutions.filter(s => s.priority === 3),
  };

  const getPriorityConfig = (priority: number) => {
    switch (priority) {
      case 1:
        return {
          title: "🎯 Prioridade Máxima",
          description: "Implemente primeiro para resultados imediatos",
          color: "bg-green-500/20 border-green-500/50",
          badge: "bg-green-500 text-white"
        };
      case 2:
        return {
          title: "⚡ Prioridade Alta",
          description: "Próximos passos para escalar resultados",
          color: "bg-yellow-500/20 border-yellow-500/50",
          badge: "bg-yellow-500 text-black"
        };
      case 3:
        return {
          title: "🚀 Prioridade Média",
          description: "Expansão e otimização avançada",
          color: "bg-blue-500/20 border-blue-500/50",
          badge: "bg-blue-500 text-white"
        };
      default:
        return {
          title: "📋 Outras Soluções",
          description: "Soluções complementares",
          color: "bg-neutral-500/20 border-neutral-500/50",
          badge: "bg-neutral-500 text-white"
        };
    }
  };

  const renderPriorityGroup = (priority: number, solutionsList: TrailSolutionEnriched[]) => {
    if (solutionsList.length === 0) return null;

    const config = getPriorityConfig(priority);

    return (
      <div key={priority} className="space-y-4">
        <div className={`rounded-lg border p-4 ${config.color}`}>
          <div className="flex items-center gap-3 mb-2">
            <Badge className={config.badge}>
              Prioridade {priority}
            </Badge>
            <h3 className="font-semibold text-white">{config.title}</h3>
          </div>
          <p className="text-sm text-neutral-300">{config.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {solutionsList.map((solution) => (
            <Card key={solution.id} className="bg-neutral-900/50 border-neutral-700/50 hover:border-viverblue/50 transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-semibold text-white line-clamp-2">
                    {solution.title}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-yellow-500 font-medium">
                      {priority}
                    </span>
                  </div>
                </div>
                
                <Badge variant="outline" className="w-fit text-xs">
                  {solution.category}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                {solution.thumbnail_url && (
                  <div className="aspect-video bg-neutral-800 rounded-lg overflow-hidden">
                    <img
                      src={solution.thumbnail_url}
                      alt={solution.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <p className="text-sm text-neutral-300 line-clamp-3">
                  {solution.description}
                </p>

                {solution.justification && (
                  <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-3">
                    <p className="text-sm text-viverblue font-medium">
                      💡 Por que para você:
                    </p>
                    <p className="text-sm text-neutral-300 mt-1">
                      {solution.justification}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {solution.difficulty}
                  </Badge>
                  {solution.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Button
                  onClick={() => navigate(`/solution/${solution.id}`)}
                  className="w-full bg-viverblue hover:bg-viverblue/90 text-white"
                >
                  Ver Solução Completa
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderPriorityGroup(1, groupedSolutions.priority1)}
      {renderPriorityGroup(2, groupedSolutions.priority2)}
      {renderPriorityGroup(3, groupedSolutions.priority3)}
    </div>
  );
};
