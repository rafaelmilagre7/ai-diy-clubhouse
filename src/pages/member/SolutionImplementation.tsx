
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useModuleImplementation } from "@/hooks/useModuleImplementation";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/transitions/PageTransition";
import { GlassCard } from "@/components/ui/GlassCard";
import { ModuleContent } from "@/components/implementation/ModuleContent";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { ImplementationNavigation } from "@/components/implementation/ImplementationNavigation";
import { ImplementationProgress } from "@/components/implementation/ImplementationProgress";
import { useImplementationNavigation } from "@/hooks/implementation/useImplementationNavigation";
import { useProgressTracking } from "@/hooks/implementation/useProgressTracking";

const SolutionImplementation = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const {
    solution,
    modules,
    currentModule,
    completedModules,
    setCompletedModules,
    progress,
    loading
  } = useModuleImplementation();

  const { handleComplete, handlePrevious, currentModuleIdx } = useImplementationNavigation();

  const {
    moduleIdx,
    hasInteracted,
    showConfirmationModal,
    setShowConfirmationModal,
    handleMarkAsCompleted,
    handleConfirmImplementation,
    calculateProgress,
    setModuleInteraction
  } = useProgressTracking(
    progress,
    completedModules,
    setCompletedModules,
    modules.length
  );

  useEffect(() => {
    if (solution) {
      console.log("Solution loaded for implementation", { 
        solution_id: solution.id,
        solution_title: solution.title,
        modules_count: modules.length,
        current_module_index: currentModuleIdx
      });
    }
  }, [solution, modules.length, currentModuleIdx]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!solution) {
    return (
      <PageTransition className="min-h-screen bg-[#0F111A] pb-16">
        <div className="container max-w-4xl py-4 md:py-6 animate-fade-in">
          <GlassCard className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Solução não encontrada</h2>
            <p className="text-muted-foreground">
              A solução que você está procurando não foi encontrada ou não está disponível.
            </p>
          </GlassCard>
        </div>
      </PageTransition>
    );
  }

  const handleModuleComplete = () => {
    console.log("Module completed, advancing to next module");
    setModuleInteraction(true);
    handleMarkAsCompleted();
  };

  const isLastModule = currentModuleIdx >= modules.length - 1;
  const progressPercentage = calculateProgress();

  return (
    <PageTransition className="min-h-screen bg-[#0F111A] pb-16">
      <div className="container max-w-6xl py-4 md:py-6 animate-fade-in">
        {/* Header da implementação */}
        <ImplementationHeader 
          solution={solution}
          currentModuleIndex={currentModuleIdx}
          totalModules={modules.length}
          currentModule={currentModule}
        />

        {/* Barra de progresso */}
        <ImplementationProgress 
          progress={progressPercentage}
          currentStep={currentModuleIdx + 1}
          totalSteps={modules.length}
          completedModules={completedModules}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Navegação lateral */}
          <div className="lg:col-span-1">
            <ImplementationNavigation
              modules={modules}
              currentModuleIndex={currentModuleIdx}
              completedModules={completedModules}
              onModuleSelect={(index) => {
                window.location.href = `/implement/${id}/${index}`;
              }}
            />
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            <GlassCard className="p-0 transition-all duration-300 shadow-xl border border-white/10">
              {currentModule ? (
                <ModuleContent
                  module={currentModule}
                  onComplete={handleModuleComplete}
                  onError={(error) => {
                    console.error("Module content error:", error);
                    toast({
                      title: "Erro no módulo",
                      description: "Ocorreu um erro ao carregar o conteúdo do módulo.",
                      variant: "destructive"
                    });
                  }}
                />
              ) : (
                <div className="p-8 text-center">
                  <h3 className="text-xl font-semibold mb-4">Módulo não encontrado</h3>
                  <p className="text-muted-foreground">
                    O módulo atual não pôde ser carregado. Por favor, tente navegar para outro módulo.
                  </p>
                </div>
              )}
            </GlassCard>

            {/* Navegação entre módulos */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={handlePrevious}
                disabled={currentModuleIdx === 0}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>

              <div className="text-sm text-muted-foreground">
                Módulo {currentModuleIdx + 1} de {modules.length}
              </div>

              {isLastModule ? (
                <button
                  onClick={handleConfirmImplementation}
                  disabled={!hasInteracted}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Finalizar Implementação
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={!hasInteracted}
                  className="px-6 py-2 bg-viverblue text-white rounded-md hover:bg-viverblue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próximo →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SolutionImplementation;
