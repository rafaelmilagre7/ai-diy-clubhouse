
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { ImplementationNavigation } from "@/components/implementation/ImplementationNavigation";
import { ImplementationTabsNavigation } from "@/components/implementation/ImplementationTabsNavigation";
import { ModuleContentTools } from "@/components/implementation/content/ModuleContentTools";
import { ModuleContentMaterials } from "@/components/implementation/content/ModuleContentMaterials";
import { ModuleContentVideos } from "@/components/implementation/content/ModuleContentVideos";
import { ModuleContentChecklist } from "@/components/implementation/content/ModuleContentChecklist";
import { CommentsSection } from "@/components/implementation/content/CommentsSection";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useImplementationData } from "@/hooks/implementation/useImplementationData";
import { useProgressTracking } from "@/hooks/implementation/useProgressTracking";
import { useImplementationNavigation } from "@/hooks/implementation/useImplementationNavigation";

const SolutionImplementation: React.FC = () => {
  const { id, moduleIdx } = useParams<{ id: string; moduleIdx: string }>();
  const currentModuleIndex = parseInt(moduleIdx || "0");
  const [activeTab, setActiveTab] = useState("tools");
  
  const {
    solution,
    modules,
    progress,
    completedModules,
    setCompletedModules,
    loading
  } = useImplementationData();
  
  const {
    handleMarkAsCompleted,
    calculateProgress,
    setModuleInteraction
  } = useProgressTracking(
    progress,
    completedModules,
    setCompletedModules,
    modules.length
  );
  
  const {
    handleNavigateToModule
  } = useImplementationNavigation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0B14] to-[#1A1E2E]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0B14] to-[#1A1E2E]">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Solução não encontrada</h2>
          <p className="text-gray-300">A solução que você está procurando não foi encontrada.</p>
        </div>
      </div>
    );
  }

  const currentModule = modules[currentModuleIndex] || null;
  const progressPercentage = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0B14] to-[#1A1E2E] text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <ImplementationHeader
          solution={solution}
          currentModuleIndex={currentModuleIndex}
          totalModules={modules.length}
          currentModule={currentModule}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <ImplementationNavigation
              modules={modules}
              currentModuleIndex={currentModuleIndex}
              completedModules={completedModules}
              onModuleSelect={handleNavigateToModule}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card className="bg-[#151823]/80 backdrop-blur-sm border-neutral-700/50">
              <CardContent className="p-6">
                {/* Tabs Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <ImplementationTabsNavigation
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />

                  {/* Tab Contents */}
                  <div className="mt-6">
                    <TabsContent value="tools" className="mt-0">
                      <ModuleContentTools
                        module={currentModule}
                        onInteraction={() => setModuleInteraction(true)}
                      />
                    </TabsContent>

                    <TabsContent value="materials" className="mt-0">
                      <ModuleContentMaterials
                        module={currentModule}
                        onInteraction={() => setModuleInteraction(true)}
                      />
                    </TabsContent>

                    <TabsContent value="videos" className="mt-0">
                      <ModuleContentVideos
                        module={currentModule}
                        onInteraction={() => setModuleInteraction(true)}
                      />
                    </TabsContent>

                    <TabsContent value="checklist" className="mt-0">
                      <ModuleContentChecklist
                        module={currentModule}
                        onInteraction={() => setModuleInteraction(true)}
                      />
                    </TabsContent>

                    <TabsContent value="comments" className="mt-0">
                      <CommentsSection
                        solutionId={id!}
                        moduleIndex={currentModuleIndex}
                        onInteraction={() => setModuleInteraction(true)}
                      />
                    </TabsContent>

                    <TabsContent value="complete" className="mt-0">
                      <div className="text-center space-y-6 py-8">
                        <div className="max-w-md mx-auto">
                          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold text-white mb-2">
                            Concluir Implementação
                          </h3>
                          <p className="text-gray-300 mb-6">
                            Você está pronto para marcar esta etapa como concluída?
                          </p>
                          <Button
                            onClick={handleMarkAsCompleted}
                            className="bg-gradient-to-r from-viverblue to-viverblue-light hover:from-viverblue/90 hover:to-viverblue-light/90 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200"
                            size="lg"
                          >
                            Marcar como Concluída
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionImplementation;
