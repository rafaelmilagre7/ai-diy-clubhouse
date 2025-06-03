
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

// Otimização: Memoizar o componente completo para evitar re-renderizações desnecessárias
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

  // Memoizar o cálculo do nome do usuário
  const userName = useMemo(() => 
    profile?.name?.split(" ")[0] || "Membro"
  , [profile?.name]);

  // Memoizar o estado de "sem soluções" para evitar recálculos
  const hasNoSolutions = useMemo(() => 
    !isLoading && 
    (!active || active.length === 0) && 
    (!completed || completed.length === 0) && 
    (!recommended || recommended.length === 0)
  , [isLoading, active, completed, recommended]);

  // Memoizar a validação de dados para evitar recálculos
  const hasValidData = useMemo(() => 
    Array.isArray(active) && Array.isArray(completed) && Array.isArray(recommended)
  , [active, completed, recommended]);

  // Memoizar os totais para o KPI Grid
  const kpiTotals = useMemo(() => ({
    completed: completed?.length || 0,
    inProgress: active?.length || 0,
    total: (active?.length || 0) + (completed?.length || 0) + (recommended?.length || 0)
  }), [active?.length, completed?.length, recommended?.length]);

  // Early return para dados inválidos
  if (!hasValidData && !isLoading) {
    return <DashboardConnectionErrorState />;
  }

  return (
    <div className="space-y-8 md:pt-2 animate-fade-in">
      {/* HEADER IMERSIVO */}
      <ModernDashboardHeader userName={userName} />

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
        <div className="space-y-10">
          <SolutionsGridLoader title="Em andamento" count={2} />
          <SolutionsGridLoader title="Concluídas" count={2} />
          <SolutionsGridLoader title="Recomendadas" count={3} />
        </div>
      ) : hasNoSolutions ? (
        <NoSolutionsPlaceholder />
      ) : (
        <div className="space-y-10">
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
