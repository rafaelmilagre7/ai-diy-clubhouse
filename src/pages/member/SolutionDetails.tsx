/**
 * 🔒 MÓDULO APROVADO - Página de Detalhes da Solução
 * Status: Produção Estável ✅
 * Função: Interface principal para visualização e interação com soluções
 * 
 * ⚠️ MUDANÇAS NESTE ARQUIVO PODEM AFETAR:
 * - Experiência completa do usuário com soluções
 * - Sistema de progresso e implementação
 * - Navegação e loading states
 */

import { useParams, useLocation } from "react-router-dom";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionInteractions } from "@/hooks/useSolutionInteractions";
import { SolutionBackButton } from "@/components/solution/SolutionBackButton";
import { SolutionHeaderSection } from "@/components/solution/SolutionHeaderSection";
import { SolutionTabsContent } from "@/components/solution/tabs/SolutionTabsContent";
import { SolutionSidebar } from "@/components/solution/SolutionSidebar";
import { SolutionMobileActions } from "@/components/solution/SolutionMobileActions";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { useEffect, useState } from "react";
import { useToolsData } from "@/hooks/useToolsData";
import { useLogging } from "@/hooks/useLogging";
import { PageTransition } from "@/components/transitions/PageTransition";
import { FadeTransition } from "@/components/transitions/FadeTransition";
import { SuccessCard } from "@/components/celebration/SuccessCard";
import { SmartFeatureGuard } from "@/components/auth/SmartFeatureGuard";
import { usePremiumUpgradeModal } from "@/hooks/usePremiumUpgradeModal";
import { AuroraUpgradeModal } from "@/components/ui/aurora-upgrade-modal";
import { useSolutionSpecificAccess } from "@/hooks/auth/useSolutionSpecificAccess";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { log, logError } = useLogging();
  const [showStartSuccess, setShowStartSuccess] = useState(false);
  
  const { modalState, hideUpgradeModal } = usePremiumUpgradeModal();
  // Garantir que os dados das ferramentas estejam corretos, mas ignorar erros
  const { isLoading: toolsDataLoading } = useToolsData();
  
  // Verificar acesso específico à solução
  const { hasAccess: hasSolutionAccess, accessType, loading: accessLoading } = useSolutionSpecificAccess(id || '');
  
  // Fetch solution data with the updated hook that includes progress
  const { solution, loading, error, progress } = useSolutionData(id);
  
  // Solution interaction handlers
  const { 
    initializing, 
    startImplementation: originalStartImplementation, 
    continueImplementation, 
    toggleFavorite, 
    downloadMaterials 
  } = useSolutionInteractions(id, progress);

  // Wrapped start implementation to show success animation
  const startImplementation = async () => {
    const result = await originalStartImplementation();
    if (result) {
      setShowStartSuccess(true);
      setTimeout(() => setShowStartSuccess(false), 3000);
    }
    return result;
  };
  
  // Log page visit
  useEffect(() => {
    if (solution) {
      log("Solution details page visited", { 
        solution_id: solution.id, 
        solution_title: solution.title,
        path: location.pathname
      });
    }
  }, [solution, location.pathname, log]);
  
  if (loading || accessLoading) {
    return <LoadingScreen message="Carregando detalhes da solução..." />;
  }
  
  if (!solution) {
    logError("Solution not found", { id });
    return <SolutionNotFound />;
  }
  
  // Log para depuração
  log("Renderizando SolutionDetails com solução", { 
    solutionId: solution.id, 
    solutionTitle: solution.title,
    progress
  });
  
  // Se não tem acesso, mostrar o SmartFeatureGuard para exibir modal de upgrade
  if (!hasSolutionAccess) {
    return (
      <>
        <SmartFeatureGuard feature="solutions">
          {/* Conteúdo nunca será mostrado por causa da verificação de acesso */}
          <div />
        </SmartFeatureGuard>
        
        <AuroraUpgradeModal 
          open={modalState.open}
          onOpenChange={hideUpgradeModal}
          feature="solutions"
          itemTitle={modalState.itemTitle || 'Desbloquear Soluções'}
        />
      </>
    );
  }

  return (
    <>
      <PageTransition>
        {/* Aurora Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-viverblue/8 via-transparent to-viverblue-dark/12" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-viverblue/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-viverblue-dark/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        </div>

        <div className="relative max-w-5xl mx-auto pb-12">
          {showStartSuccess && (
            <div className="fixed top-20 right-4 z-50 w-80">
              <SuccessCard
                title="Implementação Iniciada"
                message="Você começou a implementação dessa solução. Boa jornada!"
                type="step"
                onAnimationComplete={() => setShowStartSuccess(false)}
              />
            </div>
          )}
          
          <SolutionBackButton />
          
          <FadeTransition>
            <SolutionHeaderSection solution={solution} />
          </FadeTransition>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <FadeTransition delay={0.2}>
                <SolutionTabsContent solution={solution} />
              </FadeTransition>
              
              <FadeTransition delay={0.3}>
                <SolutionMobileActions 
                  solutionId={solution.id}
                  solutionTitle={solution.title}
                  solutionCategory={solution.category}
                  progress={progress}
                  startImplementation={startImplementation}
                  continueImplementation={continueImplementation}
                  initializing={initializing}
                />
              </FadeTransition>
            </div>
            
            <div className="md:col-span-1">
              <FadeTransition delay={0.4} direction="right">
                <SolutionSidebar 
                  solution={solution}
                  progress={progress}
                  startImplementation={startImplementation}
                  continueImplementation={continueImplementation}
                  initializing={initializing}
                />
              </FadeTransition>
            </div>
          </div>
        </div>
      </PageTransition>

      <AuroraUpgradeModal 
        open={modalState.open}
        onOpenChange={hideUpgradeModal}
        feature="solutions"
        itemTitle={modalState.itemTitle || 'Desbloquear Soluções'}
      />
    </>
  );
};

export default SolutionDetails;