
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
  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", 
      `border-l-4 border-l-${implementation.solution.category}`
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/solution/${implementation.solution.id}`} className="font-medium hover:text-viverblue transition-colors">
              {implementation.solution.title}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn(
                implementation.solution.category === "Receita" && "bg-revenue/10 text-revenue border-revenue/30",
                implementation.solution.category === "Operacional" && "bg-operational/10 text-operational border-operational/30",
                implementation.solution.category === "Estratégia" && "bg-strategy/10 text-strategy border-strategy/30"
              )}>
                {implementation.solution.category === "Receita" && "Receita"}
                {implementation.solution.category === "Operacional" && "Operacional"}
                {implementation.solution.category === "Estratégia" && "Estratégia"}
              </Badge>
              <Badge variant="neutral">
                {implementation.solution.difficulty === "easy" && "Fácil"}
                {implementation.solution.difficulty === "medium" && "Médio"}
                {implementation.solution.difficulty === "advanced" && "Avançado"}
              </Badge>
            </div>
          </div>
          {implementation.is_completed ? (
            <Badge variant="success">
              <CheckCircle className="mr-1 h-3 w-3" />
              Concluído
            </Badge>
          ) : (
            <Badge variant="warning">
              <Clock className="mr-1 h-3 w-3" />
              Em andamento
            </Badge>
          )}
        </div>
        {implementation.is_completed ? (
          <p className="text-sm text-muted-foreground mt-2">
            Concluído em {formatDate(implementation.completed_at || '')}
          </p>
        ) : (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progresso</span>
              <span>Módulo {implementation.current_module + 1} de 8</span>
            </div>
            <Progress value={((implementation.current_module + 1) / 8) * 100} className="h-2" />
            <div className="flex justify-end mt-2">
              <Button size="sm" variant="outline" asChild>
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
