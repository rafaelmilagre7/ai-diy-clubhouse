
import { FC, memo, useMemo, Suspense } from "react";
import { Solution } from "@/lib/supabase";
import { ModernDashboardHeader } from "./ModernDashboardHeader";
import { OptimizedKpiGrid } from "./OptimizedKpiGrid";
import { useAuth } from "@/contexts/auth";
import { SolutionsGridLoader } from "./SolutionsGridLoader";
import { DashboardConnectionErrorState } from "./states/DashboardConnectionErrorState";
import { NoSolutionsPlaceholder } from "./NoSolutionsPlaceholder";
import { LazyComponentLoader } from "../common/LazyComponentLoader";
import { 
  LazyActiveSolutions, 
  LazyCompletedSolutions, 
  LazyRecommendedSolutions,
  LazyImplementationTrailCard 
} from "./LazyDashboardSections";

interface DashboardLayoutProps {
  active: Solution[];
  completed: Solution[];
  recommended: Solution[];
  category: string;
  onCategoryChange: (category: string) => void;
  onSolutionClick: (solution: Solution) => void;
  isLoading?: boolean;
}

// Dashboard Layout 100% otimizado com memoização completa
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

  // Memoizar nome do usuário
  const userName = useMemo(() => 
    profile?.name?.split(" ")[0] || "Membro"
  , [profile?.name]);

  // Garantir arrays válidos - memoizado
  const { safeActive, safeCompleted, safeRecommended } = useMemo(() => ({
    safeActive: Array.isArray(active) ? active : [],
    safeCompleted: Array.isArray(completed) ? completed : [],
    safeRecommended: Array.isArray(recommended) ? recommended : []
  }), [active, completed, recommended]);

  // Memoizar estado de "sem soluções"
  const hasNoSolutions = useMemo(() => 
    !isLoading && 
    safeActive.length === 0 && 
    safeCompleted.length === 0 && 
    safeRecommended.length === 0
  , [isLoading, safeActive.length, safeCompleted.length, safeRecommended.length]);

  // Memoizar totais para KPI
  const kpiTotals = useMemo(() => ({
    completed: safeCompleted.length,
    inProgress: safeActive.length,
    total: safeActive.length + safeCompleted.length + safeRecommended.length
  }), [safeActive.length, safeCompleted.length, safeRecommended.length]);

  // Memoizar fallback de loading
  const loadingFallback = useMemo(() => (
    <div className="space-y-10">
      <SolutionsGridLoader title="Em andamento" count={2} />
      <SolutionsGridLoader title="Concluídas" count={2} />
      <SolutionsGridLoader title="Recomendadas" count={3} />
    </div>
  ), []);

  if (!profile && !isLoading) {
    return <DashboardConnectionErrorState />;
  }

  return (
    <div className="space-y-8 md:pt-2 animate-fade-in">
      {/* HEADER IMERSIVO */}
      <ModernDashboardHeader userName={userName} />

      {/* KPI GRID OTIMIZADO */}
      <OptimizedKpiGrid 
        completed={kpiTotals.completed} 
        inProgress={kpiTotals.inProgress}
        total={kpiTotals.total}
        isLoading={isLoading}
      />

      {/* TRILHA DE IMPLEMENTAÇÃO COM LAZY LOADING */}
      <div className="grid gap-6">
        <LazyComponentLoader Component={LazyImplementationTrailCard} />
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      {isLoading ? (
        loadingFallback
      ) : hasNoSolutions ? (
        <NoSolutionsPlaceholder />
      ) : (
        <div className="space-y-10">
          {/* Soluções Ativas com Lazy Loading */}
          {safeActive.length > 0 && (
            <LazyComponentLoader 
              Component={LazyActiveSolutions}
              solutions={safeActive}
              onSolutionClick={onSolutionClick}
            />
          )}

          {/* Soluções Completadas com Lazy Loading */}
          {safeCompleted.length > 0 && (
            <LazyComponentLoader 
              Component={LazyCompletedSolutions}
              solutions={safeCompleted}
              onSolutionClick={onSolutionClick}
            />
          )}

          {/* Soluções Recomendadas com Lazy Loading */}
          {safeRecommended.length > 0 && (
            <LazyComponentLoader 
              Component={LazyRecommendedSolutions}
              solutions={safeRecommended}
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
