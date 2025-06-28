
import { FC, memo, useMemo } from "react";
import { Solution } from "@/lib/supabase";
import { ModernDashboardHeader } from "./ModernDashboardHeader";
import { OptimizedKpiGrid } from "./OptimizedKpiGrid";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
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
    invalidateCache?: () => void;
  };
}

export const OptimizedDashboardLayout: FC<OptimizedDashboardLayoutProps> = memo(({
  active = [],
  completed = [],
  recommended = [],
  onSolutionClick,
  isLoading = false,
  performance
}) => {
  const { profile } = useSimpleAuth();

  console.log('[OptimizedDashboardLayout] Renderizando com:', {
    hasProfile: !!profile,
    profileName: profile?.name,
    isLoading,
    activeCount: active.length,
    completedCount: completed.length,
    recommendedCount: recommended.length
  });

  const userName = useMemo(() => 
    profile?.name?.split(" ")[0] || "Membro"
  , [profile?.name]);

  const hasNoSolutions = useMemo(() => 
    !isLoading && 
    active.length === 0 && 
    completed.length === 0 && 
    recommended.length === 0
  , [isLoading, active.length, completed.length, recommended.length]);

  const kpiTotals = useMemo(() => ({
    completed: completed.length,
    inProgress: active.length,
    total: active.length + completed.length + recommended.length
  }), [active.length, completed.length, recommended.length]);

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

  // Função auxiliar para renderizar seção de soluções
  const renderSolutionSection = (solutions: Solution[], title: string, description: string, delay: string) => {
    if (solutions.length === 0) return null;
    
    return (
      <div className="animate-fade-in" style={{ animationDelay: delay }}>
        <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>
        <p className="text-neutral-400 mb-6">{description}</p>
        <SolutionsGrid 
          solutions={solutions} 
          onSolutionClick={onSolutionClick} 
        />
      </div>
    );
  };

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

      {/* Conteúdo */}
      <div className="space-y-10">
        {/* Soluções Ativas */}
        {renderSolutionSection(
          active,
          "Projetos em andamento",
          "Continue implementando esses projetos em seu negócio",
          "0.1s"
        )}

        {/* Soluções Completadas */}
        {renderSolutionSection(
          completed,
          "Implementações concluídas",
          "Projetos que você já implementou com sucesso",
          "0.2s"
        )}

        {/* Soluções Recomendadas */}
        {renderSolutionSection(
          recommended,
          "Soluções recomendadas",
          "Soluções personalizadas para o seu negócio",
          "0.3s"
        )}
      </div>
    </div>
  );
});

OptimizedDashboardLayout.displayName = 'OptimizedDashboardLayout';
