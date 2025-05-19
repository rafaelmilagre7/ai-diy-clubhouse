
import { FC, memo } from "react";
import { ActiveSolutions } from "./ActiveSolutions";
import { CompletedSolutions } from "./CompletedSolutions";
import { RecommendedSolutions } from "./RecommendedSolutions";
import { NoSolutionsPlaceholder } from "./NoSolutionsPlaceholder";
import { Solution } from "@/lib/supabase";
import { ModernDashboardHeader } from "./ModernDashboardHeader";
import { KpiGrid } from "./KpiGrid";
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

// Otimização: Usar memo para evitar re-renderizações desnecessárias
export const DashboardLayout: FC<DashboardLayoutProps> = memo(({
  active,
  completed,
  recommended,
  category,
  onCategoryChange,
  onSolutionClick,
  isLoading = false
}) => {
  // Log de diagnóstico para ajudar a depurar o problema
  console.log("DashboardLayout renderizado:", { 
    active: active?.length || 0,
    completed: completed?.length || 0,
    recommended: recommended?.length || 0,
    isLoading,
    hasData: !!(active?.length || completed?.length || recommended?.length)
  });

  const hasNoSolutions = !isLoading && 
    (!active || active.length === 0) && 
    (!completed || completed.length === 0) && 
    (!recommended || recommended.length === 0);

  // Verificar se tem dados válidos
  const hasValidData = Array.isArray(active) && Array.isArray(completed) && Array.isArray(recommended);
  
  if (!hasValidData && !isLoading) {
    return <DashboardConnectionErrorState />;
  }

  return (
    <div className="space-y-8 md:pt-2 animate-fade-in">
      {/* HEADER IMERSIVO - Agora obtém o usuário diretamente */}
      <ModernDashboardHeader />

      {/* CARDS DE PROGRESSO (KPI) */}
      <KpiGrid 
        completed={completed?.length || 0} 
        inProgress={active?.length || 0}
        total={(active?.length || 0) + (completed?.length || 0) + (recommended?.length || 0)}
        isLoading={isLoading}
      />

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

export default DashboardLayout;
