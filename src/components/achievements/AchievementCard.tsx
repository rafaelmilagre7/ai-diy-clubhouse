
import { cn } from "@/lib/utils";
import { Achievement } from "@/types/achievementTypes";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { AchievementProgress } from "./components/AchievementProgress";
import { AchievementIcon } from "./components/AchievementIcon";
import { formatDate } from "./utils/achievementUtils";
import React, { useEffect, useRef } from "react";

interface AchievementCardProps {
  achievement: Achievement;
  shouldAnimate?: boolean;
}

export const AchievementCard = ({ achievement, shouldAnimate = false }: AchievementCardProps) => {
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((shouldAnimate || achievement.isUnlocked) && cardRef.current) {
      cardRef.current.classList.add("highlight-flash");
      setTimeout(() => {
        cardRef.current?.classList.remove("highlight-flash");
      }, 1200);
    }
  }, [achievement.isUnlocked, shouldAnimate]);

  const cardContent = (
    <Card ref={cardRef} className={cn(
      "relative overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.02]",
      "backdrop-blur-sm border-0 shadow-sm hover:shadow-md",
      achievement.isUnlocked 
        ? "bg-gradient-to-br from-white/90 to-white/50 cursor-pointer" 
        : "opacity-70 grayscale hover:opacity-80 bg-gray-50/80",
      achievement.isUnlocked && achievement.category === "revenue" && "shadow-revenue/10",
      achievement.isUnlocked && achievement.category === "operational" && "shadow-operational/10",
      achievement.isUnlocked && achievement.category === "strategy" && "shadow-strategy/10",
      achievement.isUnlocked && achievement.category === "achievement" && "shadow-viverblue/10",
      shouldAnimate && "animate-pulse-light"
    )}>
      <div className={cn(
        "absolute inset-0 opacity-10 pointer-events-none",
        achievement.category === "revenue" && "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-revenue/30 to-transparent",
        achievement.category === "operational" && "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-operational/30 to-transparent",
        achievement.category === "strategy" && "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-strategy/30 to-transparent",
        achievement.category === "achievement" && "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-viverblue/30 to-transparent"
      )} />
      
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10 transform translate-x-8 -translate-y-8">
        <div className={cn(
          "w-full h-full rounded-full",
          achievement.category === "revenue" && "bg-revenue/20",
          achievement.category === "operational" && "bg-operational/20",
          achievement.category === "strategy" && "bg-strategy/20",
          achievement.category === "achievement" && "bg-viverblue/20"
        )} />
      </div>
      
      <CardContent className="pt-6 pb-4 text-center flex flex-col items-center relative z-10">
        <AchievementIcon achievement={achievement} />
        <h3 className="font-semibold text-base mt-3">{achievement.name}</h3>
        {achievement.isUnlocked ? (
          <div className="flex items-center gap-1 mt-2">
            <div className={cn(
              "h-2 w-2 rounded-full",
              achievement.category === "revenue" && "bg-revenue",
              achievement.category === "operational" && "bg-operational",
              achievement.category === "strategy" && "bg-strategy",
              achievement.category === "achievement" && "bg-viverblue"
            )} />
            <p className="text-xs text-muted-foreground">
              Conquistado em {formatDate(achievement.earnedAt)}
            </p>
          </div>
        ) : (
          achievement.requiredCount && (
            <AchievementProgress 
              currentCount={achievement.currentCount} 
              requiredCount={achievement.requiredCount}
              category={achievement.category}
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
        <TooltipContent className="bg-slate-900 text-white border-slate-800 p-3 max-w-xs animate-fade-in">
          <p>{achievement.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
