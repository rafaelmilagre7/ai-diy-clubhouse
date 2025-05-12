
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
  
  // Função para obter classe de estilo
  const getStyleClass = () => {
    switch (difficulty) {
      case 'easy':
        return 'bg-neutral-800 text-neutral-300';
      case 'medium':
        return 'bg-neutral-800 text-neutral-300';
      case 'advanced':
        return 'bg-neutral-800 text-neutral-300';
      default:
        return 'bg-neutral-800 text-neutral-300';
    }
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "px-2 py-0.5 text-xs rounded-full border-0",
        getStyleClass()
      )}
    >
      {getLabel()}
    </Badge>
  );
};
