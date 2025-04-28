
import { Award } from "lucide-react";
import { Achievement } from "@/types/achievementTypes";
import { AchievementCard } from "./AchievementCard";

interface AchievementGridProps {
  achievements: Achievement[];
  animateIds?: string[];
}

export const AchievementGrid = ({ achievements, animateIds = [] }: AchievementGridProps) => {
  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Award className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">Nenhuma conquista encontrada</h3>
          <p className="text-muted-foreground mt-1">
            Altere o filtro ou implemente mais soluções para desbloquear conquistas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
      {achievements.map((achievement) => (
        <AchievementCard 
          key={achievement.id} 
          achievement={achievement}
          shouldAnimate={animateIds.includes(achievement.id)}
        />
      ))}
    </div>
  );
};
