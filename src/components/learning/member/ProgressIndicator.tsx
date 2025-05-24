
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  progress: number;
  isLoading?: boolean;
  hasError?: boolean;
  isCompleted?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  isLoading = false,
  hasError = false,
  isCompleted = false,
  showPercentage = true,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  if (hasError) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <AlertCircle className={cn(iconSizes[size], "text-destructive")} />
        <span className="text-sm text-destructive">Erro ao carregar progresso</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("animate-spin rounded-full border-2 border-primary border-t-transparent", iconSizes[size])} />
        <span className="text-sm text-muted-foreground">Carregando progresso...</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        {isCompleted ? (
          <CheckCircle className={cn(iconSizes[size], "text-green-500")} />
        ) : (
          <Circle className={cn(iconSizes[size], "text-muted-foreground")} />
        )}
        {showPercentage && (
          <span className={cn(
            "text-sm font-medium",
            isCompleted ? "text-green-600" : "text-foreground"
          )}>
            {progress}%
          </span>
        )}
      </div>
      
      <div className="flex-1">
        <Progress 
          value={progress} 
          className={cn(sizeClasses[size], "w-full")}
        />
      </div>
    </div>
  );
};
