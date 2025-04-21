
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: string;
}

export const DifficultyBadge = ({ difficulty }: DifficultyBadgeProps) => {
  const getColor = () => {
    switch (difficulty) {
      case "easy":
        return "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-200";
      case "medium":
        return "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200";
    }
  };

  const getLabel = () => {
    switch (difficulty) {
      case "easy":
        return "Fácil";
      case "medium":
        return "Médio";
      case "advanced":
        return "Avançado";
      default:
        return difficulty;
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border shadow-sm animate-scale-in",
        getColor()
      )}
    >
      {getLabel()}
    </span>
  );
};
