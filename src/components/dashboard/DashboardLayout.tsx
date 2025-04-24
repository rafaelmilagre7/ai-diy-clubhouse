
import { FC, memo } from "react";
import { ActiveSolutions } from "./ActiveSolutions";
import { CompletedSolutions } from "./CompletedSolutions";
import { RecommendedSolutions } from "./RecommendedSolutions";
import { NoSolutionsPlaceholder } from "./NoSolutionsPlaceholder";
import { Solution } from "@/lib/supabase";
import { ModernDashboardHeader } from "./ModernDashboardHeader";
import { KpiGrid } from "./KpiGrid";
import { useAuth } from "@/contexts/auth";
import { AchievementsSummary } from "./AchievementsSummary"; 

interface DashboardLayoutProps {
  active: Solution[];
  completed: Solution[];
  recommended: Solution[];
  category: string;
  onCategoryChange: (category: string) => void;
  onSolutionClick: (solution: Solution) => void;
}

// Otimização: Usar memo para evitar re-renderizações desnecessárias
export const DashboardLayout: FC<DashboardLayoutProps> = memo(({
  active,
  completed,
  recommended,
  category,
  onCategoryChange,
  onSolutionClick
}) => {
  const hasNoSolutions = active.length === 0 && completed.length === 0 && recommended.length === 0;
  const { profile } = useAuth();
  const userName = profile?.name?.split(" ")[0] || "Membro";

  return (
    <div className="space-y-8 md:pt-2 animate-fade-in">
      {/* HEADER IMERSIVO */}
      <ModernDashboardHeader userName={userName} />

      {/* Resumo gamificação - conquistas */}
      <div className="animate-fade-in">
        <AchievementsSummary />
      </div>

      {/* CARDS DE PROGRESSO (KPI) */}
      <KpiGrid 
        completed={completed.length} 
        inProgress={active.length}
        total={active.length + completed.length + recommended.length}
      />

      {hasNoSolutions ? (
        <NoSolutionsPlaceholder />
      ) : (
        <>
          {active.length > 0 && (
            <ActiveSolutions 
              solutions={active} 
              onSolutionClick={onSolutionClick} 
            />
          )}
          {completed.length > 0 && (
            <CompletedSolutions 
              solutions={completed} 
              onSolutionClick={onSolutionClick} 
            />
          )}
          {recommended.length > 0 && (
            <RecommendedSolutions 
              solutions={recommended} 
              onSolutionClick={onSolutionClick} 
            />
          )}
        </>
      )}
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';
