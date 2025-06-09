
import { FC, memo, useMemo } from "react";
import { ActiveSolutions } from "./ActiveSolutions";
import { CompletedSolutions } from "./CompletedSolutions";
import { RecommendedSolutions } from "./RecommendedSolutions";
import { NoSolutionsPlaceholder } from "./NoSolutionsPlaceholder";
import { ImplementationTrailCard } from "./ImplementationTrailCard";
import { Solution } from "@/lib/supabase";
import { ModernDashboardHeader } from "./ModernDashboardHeader";
import { KpiGrid } from "./KpiGrid";
import { useAuth } from "@/contexts/auth";
import { SolutionsGridLoader } from "./SolutionsGridLoader";
import { DashboardConnectionErrorState } from "./states/DashboardConnectionErrorState";
import { CategoryTabs } from "./CategoryTabs";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Sparkles, TrendingUp, Target } from "lucide-react";

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

  console.log('[DashboardLayout] Props recebidos:', {
    active: active?.length || 0,
    completed: completed?.length || 0,
    recommended: recommended?.length || 0,
    isLoading,
    profile: !!profile
  });

  const userName = useMemo(() => 
    profile?.name?.split(" ")[0] || "Membro"
  , [profile?.name]);

  const safeActive = Array.isArray(active) ? active : [];
  const safeCompleted = Array.isArray(completed) ? completed : [];
  const safeRecommended = Array.isArray(recommended) ? recommended : [];

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

  const categoryCounts = useMemo(() => {
    const allSolutions = [...safeActive, ...safeCompleted, ...safeRecommended];
    const counts = {
      all: allSolutions.length,
      Receita: 0,
      Operacional: 0,
      Estratégia: 0
    };
    
    allSolutions.forEach(solution => {
      if (solution.category && counts.hasOwnProperty(solution.category)) {
        counts[solution.category as keyof typeof counts]++;
      }
    });
    
    return counts;
  }, [safeActive, safeCompleted, safeRecommended]);

  console.log('[DashboardLayout] Estado calculado:', {
    hasNoSolutions,
    kpiTotals,
    userName,
    categoryCounts
  });

  if (!profile && !isLoading) {
    console.log('[DashboardLayout] Sem perfil, mostrando erro de conexão');
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

      {/* TRILHA DE IMPLEMENTAÇÃO PERSONALIZADA */}
      <div className="grid gap-6">
        <ImplementationTrailCard />
      </div>

      {/* SISTEMA DE CATEGORIAS MODERNO */}
      <Card variant="elevated" className="overflow-hidden bg-gradient-to-br from-surface via-surface-elevated to-surface border-border-subtle">
        <CardContent className="p-6">
          <CategoryTabs 
            activeCategory={category}
            setActiveCategory={onCategoryChange}
            counts={categoryCounts}
          />
        </CardContent>
      </Card>

      {/* INSIGHTS E ESTATÍSTICAS RÁPIDAS */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card variant="modern" className="p-6 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Target className="h-5 w-5 text-success" />
            </div>
            <Text variant="body" textColor="primary" className="font-semibold">
              Taxa de Conclusão
            </Text>
          </div>
          <Text variant="section" textColor="primary" className="font-bold mb-1">
            {kpiTotals.total > 0 ? Math.round((kpiTotals.completed / kpiTotals.total) * 100) : 0}%
          </Text>
          <Text variant="caption" textColor="secondary">
            Soluções implementadas com sucesso
          </Text>
        </Card>

        <Card variant="modern" className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <Text variant="body" textColor="primary" className="font-semibold">
              Progresso Semanal
            </Text>
          </div>
          <Text variant="section" textColor="primary" className="font-bold mb-1">
            +{kpiTotals.inProgress}
          </Text>
          <Text variant="caption" textColor="secondary">
            Soluções em andamento
          </Text>
        </Card>

        <Card variant="modern" className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <Text variant="body" textColor="primary" className="font-semibold">
              Recomendações IA
            </Text>
          </div>
          <Text variant="section" textColor="primary" className="font-bold mb-1">
            {safeRecommended.length}
          </Text>
          <Text variant="caption" textColor="secondary">
            Soluções personalizadas para você
          </Text>
        </Card>
      </div>

      {/* CONTEÚDO PRINCIPAL DE SOLUÇÕES */}
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
          {safeActive.length > 0 && (
            <ActiveSolutions
              solutions={safeActive}
              onSolutionClick={onSolutionClick}
            />
          )}

          {safeCompleted.length > 0 && (
            <CompletedSolutions
              solutions={safeCompleted}
              onSolutionClick={onSolutionClick}
            />
          )}

          {safeRecommended.length > 0 && (
            <RecommendedSolutions
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
