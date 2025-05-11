
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: string;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
  const getLevelInfo = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
      case "iniciante":
        return { label: "Iniciante", color: "bg-green-100 text-green-700 border-green-200" };
      case "intermediate":
      case "intermediário":
        return { label: "Intermediário", color: "bg-amber-100 text-amber-700 border-amber-200" };
      case "advanced":
      case "avançado":
        return { label: "Avançado", color: "bg-red-100 text-red-700 border-red-200" };
      default:
        return { label: level || "N/A", color: "bg-gray-100 text-gray-700 border-gray-200" };
    }
  };

  const { label, color } = getLevelInfo(difficulty);

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs rounded-full px-2 border",
        "transition-all duration-300 hover:scale-105",
        color
      )}
    >
      {label}
    </Badge>
  );
};
