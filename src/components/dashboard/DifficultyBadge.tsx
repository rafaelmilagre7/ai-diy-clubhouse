
import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: string;
  className?: string;
}

export const DifficultyBadge: FC<DifficultyBadgeProps> = ({ difficulty, className }) => {
  const getDifficultyConfig = (level: string) => {
    switch (level.toLowerCase()) {
      case 'iniciante':
        return { variant: 'success' as const, label: 'Iniciante' };
      case 'intermediario':
      case 'intermediário':
        return { variant: 'warning' as const, label: 'Intermediário' };
      case 'avancado':
      case 'avançado':
        return { variant: 'error' as const, label: 'Avançado' };
      default:
        return { variant: 'secondary' as const, label: difficulty };
    }
  };

  const config = getDifficultyConfig(difficulty);

  return (
    <Badge 
      variant={config.variant} 
      size="sm"
      className={cn("font-medium", className)}
    >
      {config.label}
    </Badge>
  );
};
