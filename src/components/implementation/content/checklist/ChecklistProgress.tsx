
import React from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface ChecklistProgressProps {
  completedItems: number;
  totalItems: number;
}

export const ChecklistProgress = ({
  completedItems,
  totalItems,
}: ChecklistProgressProps) => {
  const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
  const isComplete = completedItems === totalItems && totalItems > 0;

  return (
    <div className="mt-6 bg-background p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Progresso</h4>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex items-center justify-between mt-2">
        <p className="text-sm text-muted-foreground">
          {completedItems} de {totalItems} itens concluídos
        </p>
        
        {isComplete && (
          <div className="flex items-center text-aurora-primary text-sm">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            <span>Completo!</span>
          </div>
        )}
      </div>
    </div>
  );
};
