
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
    <div className="w-full min-h-screen bg-[#0F111A] space-y-0 animate-fade-in">
      {/* HEADER IMERSIVO - alinhado à esquerda */}
      <div className="pl-8 pr-6 pt-6 pb-4">
        <ModernDashboardHeader />
      </div>

      {/* CARDS DE PROGRESSO (KPI) - alinhado à esquerda */}
      <div className="pl-8 pr-6 pb-4">
        <KpiGrid 
          completed={kpiTotals.completed} 
          inProgress={kpiTotals.inProgress}
          total={kpiTotals.total}
          isLoading={isLoading}
        />
      </div>

      {/* TRILHA DE IMPLEMENTAÇÃO COM IA - alinhado à esquerda */}
      <div className="pl-8 pr-6 pb-4">
        <ImplementationTrail />
      </div>

      {/* Conteúdo principal - alinhado à esquerda */}
      <div className="pl-8 pr-6 pb-6">
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
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;
