
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

  console.log('DashboardLayout: Renderizando', {
    isLoading,
    active: active?.length || 0,
    completed: completed?.length || 0,
    recommended: recommended?.length || 0
  });

  // Nome do usuário com fallback
  const userName = useMemo(() => 
    profile?.name?.split(" ")[0] || "Membro"
  , [profile?.name]);

  // Verificar se tem dados válidos
  const hasValidData = useMemo(() => 
    Array.isArray(active) && Array.isArray(completed) && Array.isArray(recommended)
  , [active, completed, recommended]);

  // Verificar se tem algum conteúdo
  const hasAnyContent = useMemo(() => 
    (active?.length || 0) + (completed?.length || 0) + (recommended?.length || 0) > 0
  , [active?.length, completed?.length, recommended?.length]);

  // KPI totals com fallback
  const kpiTotals = useMemo(() => ({
    completed: completed?.length || 0,
    inProgress: active?.length || 0,
    total: (active?.length || 0) + (completed?.length || 0) + (recommended?.length || 0)
  }), [active?.length, completed?.length, recommended?.length]);

  // Se não tem dados válidos e não está carregando, mostrar erro
  if (!hasValidData && !isLoading) {
    return (
      <div className="space-y-8 md:pt-2">
        <ModernDashboardHeader userName={userName} />
        <Card className="p-8 text-center">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-muted-foreground">
              Não foi possível carregar os dados do dashboard. Tente recarregar a página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
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

      {/* Conteúdo principal */}
      {isLoading ? (
        <div className="space-y-10">
          <SolutionsGridLoader title="Em andamento" count={2} />
          <SolutionsGridLoader title="Concluídas" count={2} />
          <SolutionsGridLoader title="Recomendadas" count={3} />
        </div>
      ) : !hasAnyContent ? (
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

          {/* Fallback se todas as seções estão vazias mas temos dados válidos */}
          {active?.length === 0 && completed?.length === 0 && recommended?.length === 0 && (
            <Card className="p-8 text-center">
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">Nenhuma solução encontrada</h3>
                <p className="text-muted-foreground">
                  Não encontramos soluções para a categoria selecionada. Tente mudar o filtro ou entre em contato com o suporte.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;
