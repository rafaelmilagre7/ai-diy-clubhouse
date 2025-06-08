
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: string;
  className?: string;
}

export const DifficultyBadge = ({ difficulty, className }: DifficultyBadgeProps) => {
  const getDifficultyConfig = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy":
        return {
          variant: "success" as const,
          label: "Fácil"
        };
      case "medium":
        return {
          variant: "warning" as const,
          label: "Médio"
        };
      case "advanced":
        return {
          variant: "destructive" as const,
          label: "Avançado"
        };
      default:
        return {
          variant: "neutral" as const,
          label: diff
        };
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
