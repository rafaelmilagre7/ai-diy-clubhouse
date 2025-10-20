
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: string;
}

export const DifficultyBadge = ({ difficulty }: DifficultyBadgeProps) => {
  // Função para obter label em português
  const getLabel = () => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Médio';
      case 'advanced':
        return 'Avançado';
      default:
        return difficulty;
    }
  };
  
  // Função para obter classe de estilo com melhor contraste
  const getStyleClass = () => {
    switch (difficulty) {
      case 'easy':
        return 'bg-surface-elevated/60 text-system-healthy border-0';
      case 'medium':
        return 'bg-surface-elevated/60 text-status-warning border-0';
      case 'advanced':
        return 'bg-surface-elevated/60 text-system-critical border-0';
      default:
        return 'bg-surface-elevated/60 text-muted-foreground border-0';
    }
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "px-sm py-xs text-xs rounded-full",
        getStyleClass()
      )}
    >
      {getLabel()}
    </Badge>
  );
};
