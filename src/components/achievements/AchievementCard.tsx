import { Award, Star, Zap, CheckCircle, Timer, Target, Trophy, Flame } from "lucide-react";
import { Achievement } from "./AchievementGrid";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface AchievementCardProps {
  achievement: Achievement;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const AchievementCard = ({ achievement }: AchievementCardProps) => {
  const getIcon = () => {
    if (!achievement.isUnlocked) return <Trophy className="h-10 w-10" />;
    
    if (achievement.id.includes('streak')) return <Flame className="h-10 w-10" />;
    if (achievement.id.includes('speed')) return <Zap className="h-10 w-10" />;
    if (achievement.id.includes('checklist')) return <CheckCircle className="h-10 w-10" />;
    if (achievement.id.includes('perfect')) return <Star className="h-10 w-10" />;
    if (achievement.id.includes('early')) return <Timer className="h-10 w-10" />;
    if (achievement.id.includes('implementation')) return <Target className="h-10 w-10" />;
    
    return <Award className="h-10 w-10" />;
  };

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
          {achievement.isUnlocked ? (
            getIcon()
          ) : (
            <Lock className="h-10 w-10" />
          )}
        </div>
        <h3 className="font-semibold text-base">{achievement.name}</h3>
        {achievement.isUnlocked ? (
          <p className="text-xs text-muted-foreground mt-1">
            Conquistado em {formatDate(achievement.earnedAt)}
          </p>
        ) : (
          achievement.requiredCount && (
            <div className="w-full mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progresso</span>
                <span>{achievement.currentCount || 0}/{achievement.requiredCount}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full w-full">
                <div 
                  className="h-full bg-gray-300 rounded-full" 
                  style={{
                    width: `${Math.min(((achievement.currentCount || 0) / achievement.requiredCount) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
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
