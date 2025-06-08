
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: string;
  className?: string;
}

export const DifficultyBadge = ({ difficulty, className }: DifficultyBadgeProps) => {
  const getDifficultyConfig = () => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
      case 'fácil':
        return {
          label: 'Fácil',
          variant: 'success' as const
        };
      case 'medium':
      case 'médio':
        return {
          label: 'Médio',
          variant: 'warning' as const
        };
      case 'advanced':
      case 'avançado':
        return {
          label: 'Avançado',
          variant: 'destructive' as const
        };
      default:
        return {
          label: difficulty || 'Indefinido',
          variant: 'neutral' as const
        };
    }
  };

  const { label, variant } = getDifficultyConfig();

  return (
    <Badge 
      variant={variant}
      className={cn("text-xs font-medium", className)}
    >
      {label}
    </Badge>
  );
};
