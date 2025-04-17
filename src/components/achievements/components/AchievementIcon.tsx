
import { cn } from "@/lib/utils";
import { Achievement } from "@/types/achievementTypes";
import { LockIcon } from "lucide-react";
import { getAchievementIcon } from "../utils/achievementUtils";

interface AchievementIconProps {
  achievement: Achievement;
}

export const AchievementIcon = ({ achievement }: AchievementIconProps) => {
  const Icon = achievement.isUnlocked ? getAchievementIcon(achievement) : LockIcon;
  
  return (
    <div className={cn(
      "h-20 w-20 rounded-full flex items-center justify-center mb-4",
      achievement.isUnlocked 
        ? (achievement.category === "revenue" 
            ? "bg-revenue/10 text-revenue" 
            : achievement.category === "operational" 
              ? "bg-operational/10 text-operational" 
              : achievement.category === "strategy" 
                ? "bg-strategy/10 text-strategy" 
                : "bg-viverblue/10 text-viverblue")
        : "bg-gray-100 text-gray-400"
    )}>
      <Icon className="h-10 w-10" />
    </div>
  );
};
