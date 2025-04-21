
import { useNavigate } from "react-router-dom";
import { Award, Star, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAchievements } from "@/hooks/achievements/useAchievements";

export function AchievementsSummary() {
  const navigate = useNavigate();
  const { achievements, loading } = useAchievements();

  // Pegue as 3 primeiras conquistas desbloqueadas e 3 a desbloquear
  const unlocked = achievements.filter(a => a.isUnlocked).slice(0, 3);
  const locked = achievements.filter(a => !a.isUnlocked).slice(0, 3);
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const percent = achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0;

  if (loading) return (
    <div className="w-full flex justify-center py-8">
      <div className="h-8 w-8 rounded-full border-t-2 border-b-2 border-viverblue animate-spin" />
    </div>
  );

  return (
    <Card className={cn(
      "flex flex-col md:flex-row gap-4 items-center md:items-stretch p-6 mb-2 glassmorphism border-viverblue/10 animate-fade-in transition-all"
    )}>
      {/* Lado esquerdo: Progresso geral */}
      <div className="flex-1 flex flex-col items-center md:items-start justify-center gap-1">
        <span className="text-xs text-white/70 font-medium mb-1">Gamificação</span>
        <h2 className="text-lg md:text-xl font-bold text-white drop-shadow">
          {unlockedCount} de {achievements.length} conquistas desbloqueadas
        </h2>
        <div className="relative w-full h-3 bg-white/10 rounded-full mt-2 mb-1 overflow-hidden">
          <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-700" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-xs text-white/50">{percent}% conquistado</span>
        <Button 
          variant="secondary"
          size="sm"
          className="mt-3 md:mt-2 glassmorphism border-none bg-viverblue/80 hover:bg-viverblue/90 focus:ring-2 focus:ring-viverblue animate-fade-in"
          onClick={() => navigate("/achievements")}
        >
          Ver todas conquistas
        </Button>
      </div>

      {/* Lado direito: Medalhas em destaque */}
      <div className="flex flex-row items-center gap-4 mt-6 md:mt-0">
        {/* Principais conquistas desbloqueadas */}
        {unlocked.map((badge, i) => (
          <div key={badge.id} className="group flex flex-col items-center">
            <div 
              className={cn(
                "rounded-full border-2 border-green-300 bg-gradient-to-br from-viverblue-light via-green-100 to-white shadow-lg",
                "w-16 h-16 flex items-center justify-center hover:scale-110 transition-transform duration-200 ease-in-out cursor-pointer animate-scale-in"
              )}
              // Tooltip custom simples (aparecendo ao hover)
              title={badge.name + " - " + badge.description}
              tabIndex={0}
            >
              <Award className="h-8 w-8 text-green-600 drop-shadow" />
            </div>
            <span className="text-xs text-white/90 mt-1 font-semibold hidden md:block">{badge.name}</span>
          </div>
        ))}
        {/* Se ainda não tem conquistas, mostre cinza */}
        {unlocked.length === 0 && (
          <div className="flex flex-col items-center">
            <div className="rounded-full border-2 border-gray-400 bg-gray-200 w-16 h-16 flex items-center justify-center opacity-50 animate-pulse">
              <Award className="h-8 w-8 text-gray-400" />
            </div>
            <span className="text-xs text-gray-300 mt-1 font-semibold hidden md:block">Nenhuma conquista ainda</span>
          </div>
        )}
        {/* Destacar até 2 próximos badges a desbloquear */}
        {locked.map((badge, i) => (
          <div key={badge.id} className="group flex flex-col items-center opacity-60">
            <div
              className={cn(
                "rounded-full border-2 border-gray-500 bg-gradient-to-br from-gray-100 via-gray-200 to-white",
                "w-14 h-14 flex items-center justify-center hover:scale-105 transition-transform duration-200"
              )}
              title={`${badge.name}: Desbloqueie completando mais ações`}
              tabIndex={0}
            >
              <Star className="h-7 w-7 text-gray-400" />
            </div>
            <span className="text-[10px] text-white/70 mt-1 hidden md:block">{badge.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
