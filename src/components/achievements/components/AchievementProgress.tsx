
import { cn } from "@/lib/utils";
import { SolutionCategory } from "@/lib/types/categoryTypes";

interface AchievementProgressProps {
  currentCount?: number;
  requiredCount: number;
  category: "achievement" | SolutionCategory;
}

export const AchievementProgress = ({ 
  currentCount = 0, 
  requiredCount,
  category
}: AchievementProgressProps) => {
  const percentage = Math.min((currentCount / requiredCount) * 100, 100);
  
  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Progresso</span>
        <span>{currentCount}/{requiredCount}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full w-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            category === "revenue" && "bg-revenue",
            category === "operational" && "bg-operational",
            category === "strategy" && "bg-strategy",
            category === "achievement" && "bg-viverblue"
          )}
          style={{
            width: `${percentage}%`
          }}
        />
      </div>
    </div>
  );
};
