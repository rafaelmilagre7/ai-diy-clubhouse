
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAchievements } from "@/hooks/achievements/useAchievements";
import { getAchievementIcon } from "@/components/achievements/utils/achievementUtils";
import { memo, useMemo } from 'react';

// Componente memoizado para evitar re-renderizações desnecessárias
export const AchievementsSummary = memo(function AchievementsSummary() {
  const navigate = useNavigate();
  const { data: achievements = [], isLoading } = useAchievements();

  // Usar useMemo para cálculos frequentes
  const {
    unlocked,
    locked,
    unlockedCount,
    percent
  } = useMemo(() => {
    // Pegue as 3 primeiras conquistas desbloqueadas e 3 a desbloquear
    const unlockedAchievements = achievements?.filter(a => a?.isUnlocked)?.slice(0, 3) || [];
    const lockedAchievements = achievements?.filter(a => !a?.isUnlocked)?.slice(0, 3) || [];
    const count = achievements?.filter(a => a?.isUnlocked)?.length || 0;
    const percentage = achievements?.length > 0 ? Math.round((count / achievements.length) * 100) : 0;
    
    return {
      unlocked: unlockedAchievements,
      locked: lockedAchievements,
      unlockedCount: count,
      percent: percentage
    };
  }, [achievements]);

  // Navegação para página de conquistas - memoizada
  const handleViewAllClick = useMemo(() => () => {
    navigate("/achievements");
  }, [navigate]);

  if (isLoading) return (
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
        <span className="text-xs text-muted-foreground font-medium mb-1">Minhas Conquistas</span>
        <h2 className="text-lg md:text-xl font-bold text-foreground drop-shadow">
          {unlockedCount} de {achievements?.length || 0} conquistas desbloqueadas
        </h2>
        <div className="relative w-full h-3 bg-muted rounded-full mt-2 mb-1 overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-700" 
            style={{ width: `${percent}%` }} 
          />
        </div>
        <span className="text-xs text-muted-foreground">{percent}% conquistado</span>
        <Button 
          variant="secondary"
          size="sm"
          className="mt-3 md:mt-2 bg-viverblue/80 hover:bg-viverblue/90 focus:ring-2 focus:ring-viverblue animate-fade-in text-white"
          onClick={handleViewAllClick}
        >
          Ver todas conquistas
        </Button>
      </div>

      {/* Lado direito: Medalhas em destaque */}
      <div className="flex flex-row items-center gap-4 mt-6 md:mt-0">
        {/* Principais conquistas desbloqueadas */}
        {unlocked.map((badge) => {
          const Icon = getAchievementIcon(badge);
          let iconColor = "text-green-600";
          
          // Determina a cor com base na categoria
          if (badge.category === "revenue") iconColor = "text-revenue";
          else if (badge.category === "operational") iconColor = "text-operational";
          else if (badge.category === "strategy") iconColor = "text-strategy";
          else if (badge.category === "achievement") iconColor = "text-viverblue";
          
          return (
            <div key={badge.id} className="group flex flex-col items-center">
              <div 
                className={cn(
                  "rounded-full border-2 border-green-300 bg-gradient-to-br from-viverblue-light via-green-100 to-white shadow-lg",
                  "w-16 h-16 flex items-center justify-center hover:scale-110 transition-transform duration-200 ease-in-out cursor-pointer animate-scale-in"
                )}
                title={badge.name + " - " + badge.description}
                tabIndex={0}
              >
                <Icon className={`h-8 w-8 ${iconColor} drop-shadow`} />
              </div>
              <span className="text-xs text-foreground mt-1 font-semibold hidden md:block">{badge.name}</span>
            </div>
          )
        })}
        {/* Se ainda não tem conquistas, mostre cinza */}
        {unlocked.length === 0 && (
          <div className="flex flex-col items-center">
            <div className="rounded-full border-2 border-gray-400 bg-gray-200 w-16 h-16 flex items-center justify-center opacity-50 animate-pulse">
              {/* Ícone representativo para nenhuma conquista */}
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4m-7-4v-2a6 6 0 0112 0v2" />
                <circle cx={12} cy={7} r={4} />
              </svg>
            </div>
            <span className="text-xs text-gray-400 mt-1 font-semibold hidden md:block">Nenhuma conquista ainda</span>
          </div>
        )}
        {/* Destacar até 2 próximos badges a desbloquear */}
        {locked.map((badge) => {
          const Icon = getAchievementIcon(badge);
          return (
            <div key={badge.id} className="group flex flex-col items-center opacity-60">
              <div
                className={cn(
                  "rounded-full border-2 border-gray-400 bg-gradient-to-br from-gray-100 via-gray-200 to-white",
                  "w-14 h-14 flex items-center justify-center hover:scale-105 transition-transform duration-200"
                )}
                title={`${badge.name}: Desbloqueie completando mais ações`}
                tabIndex={0}
              >
                <Icon className="h-7 w-7 text-gray-400" />
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 hidden md:block">{badge.name}</span>
            </div>
          )
        })}
      </div>
    </Card>
  );
});

// Exportação padrão para compatibilidade com import padrão
export default AchievementsSummary;
