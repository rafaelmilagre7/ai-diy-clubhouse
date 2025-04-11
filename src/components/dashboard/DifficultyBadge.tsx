
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: string;
}

export const DifficultyBadge = ({ difficulty }: DifficultyBadgeProps) => {
  const getColor = () => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
        getColor()
      )}
    >
      {getLabel()}
    </span>
  );
};
