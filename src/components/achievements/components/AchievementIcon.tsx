
import { cn } from "@/lib/utils";
import { Achievement } from "@/types/achievementTypes";
import { Award, Trophy, MessageSquare, Star, Target, Flame } from "lucide-react";

interface AchievementIconProps {
  achievement: Achievement;
}

export const AchievementIcon = ({ achievement }: AchievementIconProps) => {
  const getIcon = () => {
    if (!achievement.isUnlocked) return Trophy;
    
    if (achievement.id.includes('comments')) return MessageSquare;
    if (achievement.id.includes('likes')) return Star;
    if (achievement.id.includes('streak')) return Flame;
    if (achievement.id.includes('implementation')) return Target;
    
    return Award;
  };
  
  const Icon = getIcon();
  
  return (
    <div className={cn(
      "relative group",
      "w-20 h-20 rounded-full flex items-center justify-center",
      "transition-all duration-300 transform hover:scale-105",
      achievement.isUnlocked && [
        "bg-gradient-to-br shadow-lg",
        achievement.category === "revenue" && "from-revenue/20 to-revenue/10 shadow-revenue/20",
        achievement.category === "operational" && "from-operational/20 to-operational/10 shadow-operational/20",
        achievement.category === "strategy" && "from-strategy/20 to-strategy/10 shadow-strategy/20",
        achievement.category === "achievement" && "from-viverblue/20 to-viverblue/10 shadow-viverblue/20"
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
        achievement.isUnlocked ? [
          achievement.category === "revenue" && "text-revenue",
          achievement.category === "operational" && "text-operational",
          achievement.category === "strategy" && "text-strategy",
          achievement.category === "achievement" && "text-viverblue"
        ] : "text-gray-400"
      )} />
    </div>
  );
};
