
import { FC, memo, useMemo } from "react";
import { Solution } from "@/lib/supabase";
import { ModernDashboardHeader } from "./ModernDashboardHeader";
import { OptimizedKpiGrid } from "./OptimizedKpiGrid";
import { useAuth } from "@/contexts/auth";
import { SolutionsGrid } from "./SolutionsGrid";
import { NoSolutionsPlaceholder } from "./NoSolutionsPlaceholder";
import { SolutionsGridLoader } from "./SolutionsGridLoader";

interface OptimizedDashboardLayoutProps {
  active: Solution[];
  completed: Solution[];
  recommended: Solution[];
  onSolutionClick: (solution: Solution) => void;
  isLoading?: boolean;
  performance?: {
    optimized: boolean;
    fallback?: boolean;
    cacheStatus?: any;
  };
}

export const OptimizedDashboardLayout: FC<OptimizedDashboardLayoutProps> = memo(({
  active,
  completed,
  recommended,
  onSolutionClick,
  isLoading = false,
  performance
}) => {
  const { profile } = useAuth();

  const userName = useMemo(() => 
    profile?.name?.split(" ")[0] || "Membro"
  , [profile?.name]);

  // Garantir arrays válidos
  const { safeActive, safeCompleted, safeRecommended } = useMemo(() => ({
    safeActive: Array.isArray(active) ? active : [],
    safeCompleted: Array.isArray(completed) ? completed : [],
    safeRecommended: Array.isArray(recommended) ? recommended : []
  }), [active, completed, recommended]);

  const hasNoSolutions = useMemo(() => 
    !isLoading && 
    safeActive.length === 0 && 
    safeCompleted.length === 0 && 
    safeRecommended.length === 0
  , [isLoading, safeActive.length, safeCompleted.length, safeRecommended.length]);

  const kpiTotals = useMemo(() => ({
    completed: safeCompleted.length,
    inProgress: safeActive.length,
    total: safeActive.length + safeCompleted.length + safeRecommended.length
  }), [safeActive.length, safeCompleted.length, safeRecommended.length]);

  if (isLoading) {
    return (
      <div className="space-y-8 md:pt-2">
        <ModernDashboardHeader userName={userName} />
        <OptimizedKpiGrid 
          completed={0} 
          inProgress={0}
          total={0}
          isLoading={true}
        />
        <div className="space-y-10">
          <SolutionsGridLoader title="Carregando soluções" count={3} />
        </div>
      </div>
    );
  }

  if (hasNoSolutions) {
    return (
      <div className="space-y-8 md:pt-2">
        <ModernDashboardHeader userName={userName} />
        <OptimizedKpiGrid 
          completed={kpiTotals.completed} 
          inProgress={kpiTotals.inProgress}
          total={kpiTotals.total}
          isLoading={false}
        />
        <NoSolutionsPlaceholder />
      </div>
    );
  }

  return (
    <div className="space-y-8 md:pt-2 animate-fade-in">
      {/* Header */}
      <ModernDashboardHeader userName={userName} />

      {/* KPI Grid */}
      <OptimizedKpiGrid 
        completed={kpiTotals.completed} 
        inProgress={kpiTotals.inProgress}
        total={kpiTotals.total}
        isLoading={false}
      />

      {/* Performance indicator (apenas em dev) */}
      {process.env.NODE_ENV === 'development' && performance && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          🚀 Modo: {performance.optimized ? 'Otimizado' : 'Fallback'} 
          {performance.cacheStatus?.isCached && ' | Cache Hit'}
        </div>
      )}

      {/* Conteúdo */}
      <div className="space-y-10">
        {/* Soluções Ativas */}
        {safeActive.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold mb-2 text-white">Projetos em andamento</h2>
            <p className="text-neutral-400 mb-6">
              Continue implementando esses projetos em seu negócio
            </p>
            <SolutionsGrid 
              solutions={safeActive} 
              onSolutionClick={onSolutionClick} 
            />
          </div>
        )}

        {/* Soluções Completadas */}
        {safeCompleted.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold mb-2 text-white">Implementações concluídas</h2>
            <p className="text-neutral-400 mb-6">
              Projetos que você já implementou com sucesso
            </p>
            <SolutionsGrid 
              solutions={safeCompleted} 
              onSolutionClick={onSolutionClick} 
            />
          </div>
        )}

        {/* Soluções Recomendadas */}
        {safeRecommended.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold mb-2 text-white">Soluções recomendadas</h2>
            <p className="text-neutral-400 mb-6">
              Soluções personalizadas para o seu negócio
            </p>
            <SolutionsGrid 
              solutions={safeRecommended} 
              onSolutionClick={onSolutionClick} 
            />
          </div>
        )}
      </div>
    </div>
  );
});

OptimizedDashboardLayout.displayName = 'OptimizedDashboardLayout';
