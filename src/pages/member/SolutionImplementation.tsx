
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useModuleImplementation } from "@/hooks/useModuleImplementation";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/transitions/PageTransition";
import { GlassCard } from "@/components/ui/GlassCard";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { ImplementationNavigation } from "@/components/implementation/ImplementationNavigation";
import { ImplementationProgress } from "@/components/implementation/ImplementationProgress";
import { ImplementationTabsNavigation } from "@/components/implementation/ImplementationTabsNavigation";
import { useImplementationNavigation } from "@/hooks/implementation/useImplementationNavigation";
import { useProgressTracking } from "@/hooks/implementation/useProgressTracking";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ModuleContentTools } from "@/components/implementation/content/ModuleContentTools";
import { ModuleContentMaterials } from "@/components/implementation/content/ModuleContentMaterials";
import { ModuleContentVideos } from "@/components/implementation/content/ModuleContentVideos";
import { ModuleContentChecklist } from "@/components/implementation/content/ModuleContentChecklist";
import { CommentsSection } from "@/components/implementation/content/CommentsSection";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const SolutionImplementation = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("tools");
  
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

          {/* Conteúdo principal com abas */}
          <div className="lg:col-span-3">
            <GlassCard className="p-0 transition-all duration-300 shadow-xl border border-white/10">
              {currentModule ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="p-6 pb-0">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {currentModule.title}
                      </h2>
                      <p className="text-neutral-300">
                        {currentModule.description}
                      </p>
                    </div>
                    
                    <ImplementationTabsNavigation 
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                    />
                  </div>

                  <div className="p-6 pt-0">
                    <TabsContent value="tools" className="mt-0">
                      <ModuleContentTools module={currentModule} />
                    </TabsContent>

                    <TabsContent value="materials" className="mt-0">
                      <ModuleContentMaterials module={currentModule} />
                    </TabsContent>

                    <TabsContent value="videos" className="mt-0">
                      <ModuleContentVideos module={currentModule} />
                    </TabsContent>

                    <TabsContent value="checklist" className="mt-0">
                      <ModuleContentChecklist module={currentModule} />
                    </TabsContent>

                    <TabsContent value="comments" className="mt-0">
                      <CommentsSection 
                        solutionId={solution.id}
                        moduleId={currentModule.id}
                      />
                    </TabsContent>

                    <TabsContent value="complete" className="mt-0">
                      <div className="text-center py-12">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-4">Concluir Módulo</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Você completou todas as etapas deste módulo. Clique no botão abaixo para marcar como concluído e avançar.
                        </p>
                        <Button 
                          onClick={handleModuleComplete}
                          size="lg"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          Marcar como Concluído
                        </Button>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
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
