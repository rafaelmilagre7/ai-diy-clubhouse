
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Achievement } from "@/types/achievementTypes";

interface AchievementsProgressCardProps {
  achievements: Achievement[];
}

export const AchievementsProgressCard = ({ achievements }: AchievementsProgressCardProps) => {
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const completionPercentage = achievements.length > 0
    ? Math.round((unlockedCount / achievements.length) * 100)
    : 0;

  return (
    <Card className="bg-gradient-to-br from-viverblue/10 to-viverblue/5 border border-viverblue/20 hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-shrink-0 bg-viverblue/20 rounded-full p-5 backdrop-blur-sm">
            <Trophy className="h-12 w-12 text-viverblue" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h2 className="text-xl font-semibold">Progresso de Conquistas</h2>
            <p className="text-sm text-muted-foreground">
              Você já desbloqueou {unlockedCount} de {achievements.length} conquistas disponíveis.
            </p>
            <div className="w-full mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>{unlockedCount} conquistadas</span>
                <span>{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
