
import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/dateUtils";
import { Implementation } from "@/hooks/useProfileData";

interface ImplementationCardProps {
  implementation: Implementation;
}

export const ImplementationCard = ({ implementation }: ImplementationCardProps) => {
  // Função para obter as classes de categoria de maneira correta
  const getCategoryClasses = (category: string) => {
    switch (category) {
      case "Receita":
        return "border-l-revenue border-l-4";
      case "Operacional":
        return "border-l-operational border-l-4";
      case "Estratégia":
        return "border-l-strategy border-l-4";
      default:
        return "border-l-neutral-700 border-l-4";
    }
  };

  // Função para obter classes de badge para categoria
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Receita":
        return "bg-revenue/10 text-revenue border-revenue/30";
      case "Operacional":
        return "bg-operational/10 text-operational border-operational/30";
      case "Estratégia":
        return "bg-strategy/10 text-strategy border-strategy/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden hover:shadow-md transition-all duration-300 card-hover-dark", 
      getCategoryClasses(implementation.solution.category)
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link 
              to={`/solution/${implementation.solution.id}`} 
              className="font-medium text-high-contrast hover:text-viverblue transition-colors"
            >
              {implementation.solution.title}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="outline" 
                className={cn(
                  "badge-high-contrast-dark",
                  getCategoryBadgeClass(implementation.solution.category)
                )}
              >
                {implementation.solution.category}
              </Badge>
              <Badge variant="neutral" className="badge-high-contrast-dark">
                {implementation.solution.difficulty === "easy" && "Fácil"}
                {implementation.solution.difficulty === "medium" && "Médio"}
                {implementation.solution.difficulty === "advanced" && "Avançado"}
              </Badge>
            </div>
          </div>
          {implementation.is_completed ? (
            <Badge variant="success" className="animate-fade-in">
              <CheckCircle className="mr-1 h-3 w-3" />
              Concluído
            </Badge>
          ) : (
            <Badge variant="warning" className="animate-fade-in">
              <Clock className="mr-1 h-3 w-3" />
              Em andamento
            </Badge>
          )}
        </div>
        {implementation.is_completed ? (
          <p className="text-sm text-medium-contrast mt-2">
            Concluído em {formatDate(implementation.completed_at || '')}
          </p>
        ) : (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-medium-contrast mb-1">
              <span>Progresso</span>
              <span>Módulo {implementation.current_module + 1} de 8</span>
            </div>
            <Progress 
              value={((implementation.current_module + 1) / 8) * 100} 
              className="h-2" 
            />
            <div className="flex justify-end mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                asChild 
                className="hover:bg-viverblue/10 hover:text-viverblue"
              >
                <Link to={`/implement/${implementation.solution.id}/${implementation.current_module}`}>
                  Continuar
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
