
import { FC, memo } from "react";
import { ActiveSolutions } from "./ActiveSolutions";
import { CompletedSolutions } from "./CompletedSolutions";
import { RecommendedSolutions } from "./RecommendedSolutions";
import { NoSolutionsPlaceholder } from "./NoSolutionsPlaceholder";
import { Solution } from "@/lib/supabase";
import { ModernDashboardHeader } from "./ModernDashboardHeader";
import { KpiGrid } from "./KpiGrid";
import { useAuth } from "@/contexts/auth";
import { AchievementsSummary } from "./AchievementsSummary"; 
import { SolutionsGridLoader } from "./SolutionsGridLoader";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
  const { profile, user } = useAuth();
  const userName = profile?.name?.split(" ")[0] || "Membro";
  
  console.log(`DashboardLayout: Renderizando com ${active.length} ativas, ${completed.length} completas, ${recommended.length} recomendadas, isLoading=${isLoading}`);
  
  const hasNoSolutions = !isLoading && active.length === 0 && completed.length === 0 && recommended.length === 0;
  const hasAuthError = !user && !isLoading;

  // Verificar se há problema de autenticação
  if (hasAuthError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Alert variant="destructive" className="mb-6 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problema de autenticação</AlertTitle>
          <AlertDescription>
            Não foi possível carregar seus dados. Por favor, faça login novamente.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => window.location.href = "/login"}
          variant="default"
        >
          Ir para página de login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:pt-2 animate-fade-in">
      {/* HEADER IMERSIVO */}
      <ModernDashboardHeader userName={userName} />

      {/* Resumo gamificação - conquistas */}
      <div className="animate-fade-in">
        <AchievementsSummary />
      </div>

      {/* CARDS DE PROGRESSO (KPI) */}
      <KpiGrid 
        completed={completed.length} 
        inProgress={active.length}
        total={active.length + completed.length + recommended.length}
        isLoading={isLoading}
      />

      {/* Mostrar loaders enquanto carrega, ou conteúdo quando pronto */}
      {isLoading ? (
        <SolutionsGridLoader />
      ) : hasNoSolutions ? (
        <NoSolutionsPlaceholder />
      ) : (
        <>
          {active.length > 0 && (
            <ActiveSolutions 
              solutions={active} 
              onSolutionClick={onSolutionClick} 
            />
          )}
          
          {completed.length > 0 && (
            <CompletedSolutions 
              solutions={completed} 
              onSolutionClick={onSolutionClick} 
            />
          )}
          
          {recommended.length > 0 && (
            <RecommendedSolutions 
              solutions={recommended} 
              onSolutionClick={onSolutionClick} 
            />
          )}
        </>
      )}
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';
