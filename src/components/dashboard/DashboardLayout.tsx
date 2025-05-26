
import { FC, memo } from "react";
import { ActiveSolutions } from "./ActiveSolutions";
import { CompletedSolutions } from "./CompletedSolutions";
import { RecommendedSolutions } from "./RecommendedSolutions";
import { NoSolutionsPlaceholder } from "./NoSolutionsPlaceholder";
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
  console.log("🏗️ DashboardLayout: Iniciando renderização", { 
    active: active?.length || 0,
    completed: completed?.length || 0,
    recommended: recommended?.length || 0,
    isLoading,
    category
  });

  const { profile } = useAuth();
  const userName = profile?.name?.split(" ")[0] || "Membro";

  // Verificar se tem dados válidos
  const hasValidData = Array.isArray(active) && Array.isArray(completed) && Array.isArray(recommended);
  console.log("✅ DashboardLayout: Validação de dados", { hasValidData, isLoading });
  
  if (!hasValidData && !isLoading) {
    console.log("❌ DashboardLayout: Dados inválidos, renderizando erro de conexão");
    return <DashboardConnectionErrorState />;
  }

  const hasNoSolutions = !isLoading && 
    (!active || active.length === 0) && 
    (!completed || completed.length === 0) && 
    (!recommended || recommended.length === 0);

  console.log("📊 DashboardLayout: Estado das soluções", {
    hasNoSolutions,
    isLoading,
    userName
  });

  return (
    <div className="space-y-8 md:pt-2 animate-fade-in">
      {/* HEADER IMERSIVO */}
      <ModernDashboardHeader userName={userName} />

      {/* CARDS DE PROGRESSO (KPI) */}
      <KpiGrid 
        completed={completed?.length || 0} 
        inProgress={active?.length || 0}
        total={(active?.length || 0) + (completed?.length || 0) + (recommended?.length || 0)}
        isLoading={isLoading}
      />

      {/* Conteúdo principal */}
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
