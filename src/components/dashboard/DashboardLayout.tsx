
import { FC, memo, useMemo } from "react";
import { ActiveSolutions } from "./ActiveSolutions";
import { CompletedSolutions } from "./CompletedSolutions";
import { RecommendedSolutions } from "./RecommendedSolutions";
import { NoSolutionsPlaceholder } from "./NoSolutionsPlaceholder";
import { ImplementationTrail } from "./ImplementationTrail";
import { Solution } from "@/lib/supabase";
import { ModernDashboardHeader } from "./ModernDashboardHeader";
import { KpiGrid } from "./KpiGrid";
import { useAuth } from "@/contexts/auth";
import { SolutionsGridLoader } from "./SolutionsGridLoader";
import { DashboardConnectionErrorState } from "./states/DashboardConnectionErrorState";

interface DashboardLayoutProps {
  active: Solution[];
  completed: Solution[];
  recommended: Solution[];
  category: string;
  onCategoryChange: (category: string) => void;
  onSolutionClick: (solution: Solution) => void;
  isLoading?: boolean;
}

export const DashboardLayout: FC<DashboardLayoutProps> = memo(({
  active,
  completed,
  recommended,
  category,
  onCategoryChange,
  onSolutionClick,
  isLoading = false
}) => {
  const { profile } = useAuth();

  const userName = useMemo(() => 
    profile?.name?.split(" ")[0] || "Membro"
  , [profile?.name]);

  const hasNoSolutions = useMemo(() => 
    !isLoading && 
    (!active || active.length === 0) && 
    (!completed || completed.length === 0) && 
    (!recommended || recommended.length === 0)
  , [isLoading, active, completed, recommended]);

  const hasValidData = useMemo(() => 
    Array.isArray(active) && Array.isArray(completed) && Array.isArray(recommended)
  , [active, completed, recommended]);

  const kpiTotals = useMemo(() => ({
    completed: completed?.length || 0,
    inProgress: active?.length || 0,
    total: (active?.length || 0) + (completed?.length || 0) + (recommended?.length || 0)
  }), [active?.length, completed?.length, recommended?.length]);

  if (!hasValidData && !isLoading) {
    return <DashboardConnectionErrorState />;
  }

  return (
    <div className="w-full space-y-4 animate-fade-in">
      {/* HEADER IMERSIVO */}
      <ModernDashboardHeader />

      {/* CARDS DE PROGRESSO (KPI) */}
      <KpiGrid 
        completed={kpiTotals.completed} 
        inProgress={kpiTotals.inProgress}
        total={kpiTotals.total}
        isLoading={isLoading}
      />

      {/* TRILHA DE IMPLEMENTAÇÃO COM IA */}
      <ImplementationTrail />

      {/* Mostrar loaders enquanto carrega, ou conteúdo quando pronto */}
      {isLoading ? (
        <div className="space-y-6">
          <SolutionsGridLoader title="Em andamento" count={2} />
          <SolutionsGridLoader title="Concluídas" count={2} />
          <SolutionsGridLoader title="Recomendadas" count={3} />
        </div>
      ) : hasNoSolutions ? (
        <NoSolutionsPlaceholder 
          title="Nenhuma solução encontrada"
          description="Comece explorando nossas soluções recomendadas para transformar seu negócio com IA"
        />
      ) : (
        <div className="space-y-6">
          {/* Soluções Ativas */}
          {active && active.length > 0 && (
            <ActiveSolutions
              solutions={active}
              onSolutionClick={onSolutionClick}
            />
          )}

          {/* Soluções Completadas */}
          {completed && completed.length > 0 && (
            <CompletedSolutions
              solutions={completed}
              onSolutionClick={onSolutionClick}
            />
          )}

          {/* Soluções Recomendadas */}
          {recommended && recommended.length > 0 && (
            <RecommendedSolutions
              solutions={recommended}
              onSolutionClick={onSolutionClick}
            />
          )}
        </div>
      )}
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;
