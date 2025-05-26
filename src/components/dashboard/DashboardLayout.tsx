
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
      {console.log("🎨 DashboardLayout: Renderizando header")}
      
      {/* HEADER IMERSIVO */}
      <ModernDashboardHeader userName={userName} />

      {console.log("📈 DashboardLayout: Renderizando KPI Grid")}
      
      {/* CARDS DE PROGRESSO (KPI) */}
      <KpiGrid 
        completed={completed?.length || 0} 
        inProgress={active?.length || 0}
        total={(active?.length || 0) + (completed?.length || 0) + (recommended?.length || 0)}
        isLoading={isLoading}
      />

      {console.log("📋 DashboardLayout: Renderizando conteúdo principal", { isLoading, hasNoSolutions })}

      {/* Conteúdo principal */}
      {isLoading ? (
        <div className="space-y-10">
          {console.log("⏳ DashboardLayout: Renderizando loaders")}
          <SolutionsGridLoader title="Em andamento" count={2} />
          <SolutionsGridLoader title="Concluídas" count={2} />
          <SolutionsGridLoader title="Recomendadas" count={3} />
        </div>
      ) : hasNoSolutions ? (
        <>
          {console.log("🚫 DashboardLayout: Renderizando placeholder - sem soluções")}
          <NoSolutionsPlaceholder />
        </>
      ) : (
        <div className="space-y-10">
          {console.log("✅ DashboardLayout: Renderizando soluções", {
            activeCount: active?.length,
            completedCount: completed?.length,
            recommendedCount: recommended?.length
          })}
          
          {/* Soluções Ativas */}
          {active && active.length > 0 && (
            <>
              {console.log("🔥 DashboardLayout: Renderizando soluções ativas")}
              <ActiveSolutions
                solutions={active}
                onSolutionClick={onSolutionClick}
              />
            </>
          )}

          {/* Soluções Completadas */}
          {completed && completed.length > 0 && (
            <>
              {console.log("✅ DashboardLayout: Renderizando soluções completadas")}
              <CompletedSolutions
                solutions={completed}
                onSolutionClick={onSolutionClick}
              />
            </>
          )}

          {/* Soluções Recomendadas */}
          {recommended && recommended.length > 0 && (
            <>
              {console.log("💡 DashboardLayout: Renderizando soluções recomendadas")}
              <RecommendedSolutions
                solutions={recommended}
                onSolutionClick={onSolutionClick}
              />
            </>
          )}
        </div>
      )}

      {console.log("🏁 DashboardLayout: Renderização concluída")}
    </div>
  );
});

export default DashboardLayout;
