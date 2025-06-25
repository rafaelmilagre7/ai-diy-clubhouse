
import { FC, memo, useMemo, Suspense } from "react";
import { Solution } from "@/lib/supabase";
import { ModernDashboardHeader } from "./ModernDashboardHeader";
import { OptimizedKpiGrid } from "./OptimizedKpiGrid";
import { useAuth } from "@/contexts/auth";
import { SolutionsGridLoader } from "./SolutionsGridLoader";
import { DashboardConnectionErrorState } from "./states/DashboardConnectionErrorState";
import { NoSolutionsPlaceholder } from "./NoSolutionsPlaceholder";
import { LazyComponentLoader } from "../common/LazyComponentLoader";
import { VirtualizedSolutionsGrid } from "./VirtualizedSolutionsGrid";
import { SolutionsGrid } from "./SolutionsGrid";
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

  // Componente otimizado para renderizar soluções com virtualização condicional
  const OptimizedSolutionsRenderer = memo<{
    solutions: Solution[];
    onSolutionClick: (solution: Solution) => void;
    title: string;
  }>(({ solutions, onSolutionClick, title }) => {
    if (solutions.length > 12) {
      return (
        <VirtualizedSolutionsGrid
          solutions={solutions}
          onSolutionClick={onSolutionClick}
          itemsPerRow={3}
          rowHeight={320}
          gridHeight={600}
        />
      );
    }
    
    return (
      <SolutionsGrid 
        solutions={solutions} 
        onSolutionClick={onSolutionClick} 
      />
    );
  });

  OptimizedSolutionsRenderer.displayName = 'OptimizedSolutionsRenderer';

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
        <Suspense fallback={<SolutionsGridLoader title="Trilha de Implementação" count={1} />}>
          <LazyComponentLoader Component={LazyImplementationTrailCard} />
        </Suspense>
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
            <Suspense fallback={<SolutionsGridLoader title="Em andamento" count={safeActive.length} />}>
              <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-2xl font-bold mb-2 text-white">Projetos em andamento</h2>
                <p className="text-neutral-400 mb-6">
                  Continue implementando esses projetos em seu negócio
                </p>
                <OptimizedSolutionsRenderer
                  solutions={safeActive}
                  onSolutionClick={onSolutionClick}
                  title="Ativas"
                />
              </div>
            </Suspense>
          )}

          {/* Soluções Completadas com Lazy Loading */}
          {safeCompleted.length > 0 && (
            <Suspense fallback={<SolutionsGridLoader title="Concluídas" count={safeCompleted.length} />}>
              <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-2xl font-bold mb-2 text-white">Implementações concluídas</h2>
                <p className="text-neutral-400 mb-6">
                  Projetos que você já implementou com sucesso
                </p>
                <OptimizedSolutionsRenderer
                  solutions={safeCompleted}
                  onSolutionClick={onSolutionClick}
                  title="Completadas"
                />
              </div>
            </Suspense>
          )}

          {/* Soluções Recomendadas com Lazy Loading */}
          {safeRecommended.length > 0 && (
            <Suspense fallback={<SolutionsGridLoader title="Recomendadas" count={safeRecommended.length} />}>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Soluções recomendadas</h2>
                <p className="text-muted-foreground mb-4">
                  Soluções personalizadas para o seu negócio
                </p>
                <OptimizedSolutionsRenderer
                  solutions={safeRecommended}
                  onSolutionClick={onSolutionClick}
                  title="Recomendadas"
                />
              </div>
            </Suspense>
          )}
        </div>
      )}
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;
