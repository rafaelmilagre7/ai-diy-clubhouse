
import { cn } from "@/lib/utils";
import { Achievement } from "@/types/achievementTypes";
import { getAchievementIcon } from "../utils/achievementUtils";

interface AchievementIconProps {
  achievement: Achievement;
}

export const AchievementIcon = ({ achievement }: AchievementIconProps) => {
  const Icon = getAchievementIcon(achievement);

  // Aplica cores específicas baseadas na categoria
  const getIconColor = () => {
    if (!achievement.isUnlocked) return "text-gray-400";
    
    switch (achievement.category) {
      case "revenue":
        return "text-revenue";
      case "operational":
        return "text-operational";
      case "strategy":
        return "text-strategy";
      case "achievement":
        return "text-viverblue";
      default:
        return "text-viverblue";
    }
  };

  // Aplica gradientes específicos baseados na categoria
  const getGradientClass = () => {
    if (!achievement.isUnlocked) return "bg-gray-100";
    
    switch (achievement.category) {
      case "revenue":
        return "from-revenue/20 to-revenue/10 shadow-revenue/20";
      case "operational":
        return "from-operational/20 to-operational/10 shadow-operational/20";
      case "strategy":
        return "from-strategy/20 to-strategy/10 shadow-strategy/20";
      case "achievement":
        return "from-viverblue/20 to-viverblue/10 shadow-viverblue/20";
      default:
        return "from-viverblue/20 to-viverblue/10 shadow-viverblue/20";
    }
  };

  return (
    <div className={cn(
      "relative group",
      "w-20 h-20 rounded-full flex items-center justify-center",
      "transition-all duration-300 transform hover:scale-105",
      achievement.isUnlocked && [
        "bg-gradient-to-br shadow-lg",
        getGradientClass()
      ],
      !achievement.isUnlocked && "bg-gray-100"
    )}>
      <div className={cn(
        "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]",
        achievement.isUnlocked && [
          achievement.category === "revenue" && "from-revenue/30 via-transparent to-transparent",
          achievement.category === "operational" && "from-operational/30 via-transparent to-transparent",
          achievement.category === "strategy" && "from-strategy/30 via-transparent to-transparent",
          achievement.category === "achievement" && "from-viverblue/30 via-transparent to-transparent"
        ]
      )} />
      <Icon className={cn(
        "h-10 w-10 relative z-10 transition-transform duration-300 group-hover:scale-110",
        getIconColor()
      )} />
    </div>
  );
};
