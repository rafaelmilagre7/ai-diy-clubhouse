
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Download, Users, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Solution } from "@/types/solution";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";

interface SolutionSidebarProps {
  solution: Solution;
  progress: any;
  implementationMetrics?: any;
  startImplementation: () => Promise<void>;
  continueImplementation: () => Promise<void>;
  initializing: boolean;
}

export const SolutionSidebar = ({ 
  solution,
  progress,
  implementationMetrics,
  startImplementation,
  continueImplementation,
  initializing
}: SolutionSidebarProps) => {
  // Calcular percentual de conclusão
  const completionPercentage = progress?.completion_percentage || 0;
  const isCompleted = progress?.is_completed;
  const hasStarted = progress !== null;
  
  // Determinar o texto do botão principal
  const getPrimaryButtonText = () => {
    if (isCompleted) return "Ver Certificado";
    if (hasStarted) return "Continuar Implementação";
    return "Implementar Solução";
  };
  
  // Definir a ação do botão principal
  const handlePrimaryAction = () => {
    if (isCompleted) {
      // Lógica para ver certificado (a ser implementada)
    } else if (hasStarted) {
      continueImplementation();
    } else {
      startImplementation();
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-5 border shadow-sm">
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold text-lg mb-3">Implementação</h3>
            {hasStarted ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Seu progresso</span>
                  <span>{Math.round(completionPercentage)}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                Implemente esta solução para alavancar seu negócio com IA.
              </p>
            )}
            
            <div className="mt-4">
              <Button 
                onClick={handlePrimaryAction} 
                className="w-full"
                disabled={initializing}
              >
                {initializing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparando...
                  </>
                ) : (
                  <>
                    {isCompleted ? <Award className="mr-2 h-4 w-4" /> : 
                     hasStarted ? <ArrowRight className="mr-2 h-4 w-4" /> : 
                     <ArrowRight className="mr-2 h-4 w-4" />}
                    {getPrimaryButtonText()}
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open("https://viderdeia.ai/contratar", "_blank")}
              >
                <Users className="mr-2 h-4 w-4" />
                Contratar Implementação
              </Button>
            </div>
            
            {hasStarted && !isCompleted && progress?.last_activity && (
              <div className="mt-4 text-xs text-muted-foreground text-center">
                Última atividade: {formatDate(progress.last_activity)}
              </div>
            )}
          </div>
          
          <hr />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dificuldade</span>
              <span className={cn(
                "font-medium",
                solution.difficulty === "easy" && "text-green-500",
                solution.difficulty === "medium" && "text-orange-500",
                solution.difficulty === "advanced" && "text-red-500"
              )}>
                {solution.difficulty === "easy" && "Fácil"}
                {solution.difficulty === "medium" && "Média"}
                {solution.difficulty === "advanced" && "Avançada"}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tempo estimado</span>
              <span className="font-medium">{solution.estimated_time || "30"} min</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Publicado em</span>
              <span className="font-medium">{formatDate(solution.created_at)}</span>
            </div>
            
            {implementationMetrics && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Implementações</span>
                  <span className="font-medium">{implementationMetrics.total_completions || 0}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de sucesso</span>
                  <span className="font-medium">{solution.success_rate || 98}%</span>
                </div>
              </>
            )}
          </div>
          
          {isCompleted && (
            <>
              <hr />
              <div className="flex items-center justify-center p-2 bg-green-50 rounded-lg">
                <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                <span className="text-green-700 text-sm font-medium">
                  Implementado com sucesso!
                </span>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
