import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowProgressBarProps {
  completed: number;
  total: number;
  percentage: number;
  onMarkComplete?: () => void;
  isCompleting?: boolean;
  className?: string;
}

export const FlowProgressBar: React.FC<FlowProgressBarProps> = ({
  completed,
  total,
  percentage,
  onMarkComplete,
  isCompleting = false,
  className
}) => {
  const isFullyCompleted = completed >= total && total > 0;

  return (
    <div className={cn("sticky top-4 z-10 bg-surface/95 backdrop-blur-md border border-border rounded-lg p-4 shadow-lg", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full",
            isFullyCompleted ? "bg-success/20" : "bg-primary/20"
          )}>
            {isFullyCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Circle className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-high-contrast">
              Progresso de Implementação
            </p>
            <p className="text-xs text-medium-contrast">
              {completed} de {total} etapas concluídas
            </p>
          </div>
        </div>

        {onMarkComplete && (
          <Button
            onClick={onMarkComplete}
            disabled={!isFullyCompleted || isCompleting}
            size="sm"
            variant={isFullyCompleted ? "default" : "outline"}
            className="min-w-[140px]"
          >
            {isCompleting ? (
              <>
                <Circle className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : isFullyCompleted ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Concluir solução
              </>
            ) : (
              `${total - completed} etapas restantes`
            )}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Progress value={percentage} className="h-2" />
        <div className="flex justify-between text-xs text-medium-contrast">
          <span>{percentage}% completo</span>
          {!isFullyCompleted && (
            <span>Continue implementando para desbloquear certificado</span>
          )}
        </div>
      </div>

      {isFullyCompleted && (
        <div className="mt-3 p-2 bg-success/10 border border-success/20 rounded-md">
          <p className="text-xs text-success text-center font-medium">
            🎉 Parabéns! Todas as etapas foram concluídas
          </p>
        </div>
      )}
    </div>
  );
};
