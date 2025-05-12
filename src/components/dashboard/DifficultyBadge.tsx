
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
        return 'bg-neutral-800/60 text-emerald-400 border-0';
      case 'medium':
        return 'bg-neutral-800/60 text-amber-400 border-0';
      case 'advanced':
        return 'bg-neutral-800/60 text-rose-400 border-0';
      default:
        return 'bg-neutral-800/60 text-neutral-300 border-0';
    }
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "px-2 py-0.5 text-xs rounded-full",
        getStyleClass()
      )}
    >
      {getLabel()}
    </Badge>
  );
};
