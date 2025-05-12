
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
        return 'bg-neutral-800/80 text-emerald-400 border-emerald-900/20';
      case 'medium':
        return 'bg-neutral-800/80 text-amber-400 border-amber-900/20';
      case 'advanced':
        return 'bg-neutral-800/80 text-rose-400 border-rose-900/20';
      default:
        return 'bg-neutral-800/80 text-neutral-300 border-neutral-700';
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
