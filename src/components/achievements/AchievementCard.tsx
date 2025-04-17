
import { cn } from "@/lib/utils";
import { Achievement } from "@/types/achievementTypes";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { AchievementProgress } from "./components/AchievementProgress";
import { AchievementIcon } from "./components/AchievementIcon";
import { formatDate } from "./utils/achievementUtils";

interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard = ({ achievement }: AchievementCardProps) => {
  const isMobile = useIsMobile();
  
  const cardContent = (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200",
      achievement.isUnlocked 
        ? "hover:shadow-md cursor-pointer" 
        : "opacity-70 grayscale hover:opacity-80"
    )}>
      <div className={cn(
        "absolute top-0 right-0 w-0 h-0 border-t-[3rem] border-r-[3rem]",
        achievement.category === "revenue" && "border-t-revenue/20 border-r-revenue/20",
        achievement.category === "operational" && "border-t-operational/20 border-r-operational/20",
        achievement.category === "strategy" && "border-t-strategy/20 border-r-strategy/20",
        achievement.category === "achievement" && "border-t-viverblue/20 border-r-viverblue/20"
      )} />
      <CardContent className="pt-6 pb-4 text-center flex flex-col items-center">
        <AchievementIcon achievement={achievement} />
        <h3 className="font-semibold text-base">{achievement.name}</h3>
        {achievement.isUnlocked ? (
          <p className="text-xs text-muted-foreground mt-1">
            Conquistado em {formatDate(achievement.earnedAt)}
          </p>
        ) : (
          achievement.requiredCount && (
            <AchievementProgress 
              currentCount={achievement.currentCount} 
              requiredCount={achievement.requiredCount}
            />
          )
        )}
      </CardContent>
    </Card>
  );

  if (isMobile) {
    return cardContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {cardContent}
        </TooltipTrigger>
        <TooltipContent>
          <p>{achievement.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
