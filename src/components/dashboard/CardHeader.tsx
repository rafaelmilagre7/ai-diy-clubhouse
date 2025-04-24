
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "./DifficultyBadge";
import { SolutionCategory, getCategoryDisplayName, getCategoryStyles } from "@/lib/types/appTypes";

interface CardHeaderProps {
  category: SolutionCategory; 
  difficulty: string;
}

export const CardHeader = ({ category, difficulty }: CardHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <Badge variant="outline" className={cn(
        "px-3 py-1 font-medium rounded-full border-0 shadow-sm animate-slide-in",
        getCategoryStyles(category)
      )}>
        {getCategoryDisplayName(category)}
      </Badge>
      <DifficultyBadge difficulty={difficulty} />
    </div>
  );
};
