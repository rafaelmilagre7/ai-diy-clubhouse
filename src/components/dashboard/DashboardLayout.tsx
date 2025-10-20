
import { FC, memo, useMemo } from "react";
import { NoSolutionsPlaceholder } from "./NoSolutionsPlaceholder";
import { Solution } from "@/lib/supabase";
import { ModernDashboardHeader } from "./ModernDashboardHeader";
import { AuroraKpiGrid } from "./AuroraKpiGrid";
import { useAuth } from "@/contexts/auth";
import { SolutionsSkeletonGrid } from "./SmoothLoadingStates";
import { DashboardConnectionErrorState } from "./states/DashboardConnectionErrorState";
import { 
  LazyActiveSolutions, 
  LazyCompletedSolutions, 
  LazyRecommendedSolutions,
  LazyComponentWrapper 
} from "./LazyComponents";

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

  // Memoizar o cálculo do nome do usuário
  const userName = useMemo(() => 
    profile?.name?.split(" ")[0] || "Membro"
  , [profile?.name]);

  // Garantir que os arrays existam e sejam válidos - memoizado
  const { safeActive, safeCompleted, safeRecommended } = useMemo(() => ({
    safeActive: Array.isArray(active) ? active : [],
    safeCompleted: Array.isArray(completed) ? completed : [],
    safeRecommended: Array.isArray(recommended) ? recommended : []
  }), [active, completed, recommended]);

  // Memoizar o estado de "sem soluções" para evitar recálculos
  const hasNoSolutions = useMemo(() => 
    !isLoading && 
    safeActive.length === 0 && 
    safeCompleted.length === 0 && 
    safeRecommended.length === 0
  , [isLoading, safeActive.length, safeCompleted.length, safeRecommended.length]);

  // Memoizar os totais para o KPI Grid
  const kpiTotals = useMemo(() => ({
    completed: safeCompleted.length,
    inProgress: safeActive.length,
    total: safeActive.length + safeCompleted.length + safeRecommended.length
  }), [safeActive.length, safeCompleted.length, safeRecommended.length]);

  // Se não há perfil e não está carregando, mostrar erro
  if (!profile && !isLoading) {
    return <DashboardConnectionErrorState />;
  }

  return (
    <div className="space-y-lg md:pt-2 animate-fade-in">
      {/* HEADER IMERSIVO */}
      <ModernDashboardHeader userName={userName} />

      {/* AURORA KPI GRID - Novo componente com design moderno */}
      <AuroraKpiGrid 
        completed={kpiTotals.completed} 
        inProgress={kpiTotals.inProgress}
        total={kpiTotals.total}
        isLoading={isLoading}
      />

      {/* Loading states otimizados com transições suaves */}
      {isLoading ? (
        <div className="space-y-10">
          <SolutionsSkeletonGrid title="Em andamento" count={2} />
          <SolutionsSkeletonGrid title="Concluídas" count={2} />
          <SolutionsSkeletonGrid title="Recomendadas" count={3} />
        </div>
      ) : hasNoSolutions ? (
        <NoSolutionsPlaceholder />
      ) : (
        <div className="space-y-10">
          {/* Soluções Ativas com Lazy Loading */}
          {safeActive.length > 0 && (
            <LazyComponentWrapper title="Em andamento" count={safeActive.length}>
              <LazyActiveSolutions
                solutions={safeActive}
                onSolutionClick={onSolutionClick}
              />
            </LazyComponentWrapper>
          )}

          {/* Soluções Completadas com Lazy Loading */}
          {safeCompleted.length > 0 && (
            <LazyComponentWrapper title="Concluídas" count={safeCompleted.length}>
              <LazyCompletedSolutions
                solutions={safeCompleted}
                onSolutionClick={onSolutionClick}
              />
            </LazyComponentWrapper>
          )}

          {/* Soluções Recomendadas com Lazy Loading */}
          {safeRecommended.length > 0 && (
            <LazyComponentWrapper title="Recomendadas" count={safeRecommended.length}>
              <LazyRecommendedSolutions
                solutions={safeRecommended}
                onSolutionClick={onSolutionClick}
              />
            </LazyComponentWrapper>
          )}
        </div>
      )}
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;
