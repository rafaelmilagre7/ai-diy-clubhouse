
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ImplementationTabsNavigation } from "@/components/implementation/ImplementationTabsNavigation";
import { ModuleContentTools } from "@/components/implementation/content/ModuleContentTools";
import { ModuleContentMaterials } from "@/components/implementation/content/ModuleContentMaterials";
import { ModuleContentVideos } from "@/components/implementation/content/ModuleContentVideos";
import { ModuleContentChecklist } from "@/components/implementation/content/ModuleContentChecklist";
import { CommentsSection } from "@/components/implementation/content/CommentsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft, Target } from "lucide-react";
import { useImplementationData } from "@/hooks/implementation/useImplementationData";
import { useProgressTracking } from "@/hooks/implementation/useProgressTracking";
import { useImplementationNavigation } from "@/hooks/implementation/useImplementationNavigation";
import { useNavigate } from "react-router-dom";

const SolutionImplementation: React.FC = () => {
  const { id, moduleIdx } = useParams<{ id: string; moduleIdx: string }>();
  const currentModuleIndex = parseInt(moduleIdx || "0");
  const [activeTab, setActiveTab] = useState("tools");
  const navigate = useNavigate();
  
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
        {/* Header melhorado */}
        <div className="mb-8">
          {/* Botão de voltar */}
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white mb-6"
            onClick={() => navigate("/solutions")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Soluções
          </Button>

          {/* Título e informações da solução */}
          <div className="bg-gradient-to-r from-[#151823]/90 to-[#1A1E2E]/90 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-3">
                    {solution.title}
                  </h1>
                  <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
                    {solution.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="bg-viverblue/20 text-viverblue border-viverblue/30">
                    {solution.category}
                  </Badge>
                  <Badge variant="outline" className="text-gray-300 border-gray-600">
                    {solution.difficulty}
                  </Badge>
                  {solution.estimated_time && (
                    <Badge variant="outline" className="text-gray-300 border-gray-600">
                      {solution.estimated_time} min
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 text-viverblue mb-2">
                  <Target className="h-5 w-5" />
                  <span className="font-medium">Implementação</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(progressPercentage)}%
                </div>
                <div className="text-sm text-gray-400">
                  Progresso
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard de implementação */}
        <Card className="bg-[#151823]/80 backdrop-blur-sm border-neutral-700/50">
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <ImplementationTabsNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              {/* Conteúdo das abas */}
              <div className="mt-8">
                <TabsContent value="tools" className="mt-0">
                  <ModuleContentTools
                    module={currentModule}
                  />
                </TabsContent>

                <TabsContent value="materials" className="mt-0">
                  <ModuleContentMaterials
                    module={currentModule}
                  />
                </TabsContent>

                <TabsContent value="videos" className="mt-0">
                  <ModuleContentVideos
                    module={currentModule}
                  />
                </TabsContent>

                <TabsContent value="checklist" className="mt-0">
                  <ModuleContentChecklist
                    module={currentModule}
                  />
                </TabsContent>

                <TabsContent value="comments" className="mt-0">
                  <CommentsSection
                    solutionId={id!}
                    moduleId={currentModule?.id || 'default'}
                  />
                </TabsContent>

                <TabsContent value="complete" className="mt-0">
                  <div className="text-center space-y-8 py-12">
                    <div className="max-w-md mx-auto">
                      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full p-6 w-32 h-32 mx-auto flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-4">
                        Concluir Implementação
                      </h3>
                      <p className="text-gray-300 mb-8 text-lg">
                        Parabéns! Você está pronto para marcar esta solução como concluída e celebrar seu progresso.
                      </p>
                      <Button
                        onClick={handleMarkAsCompleted}
                        className="bg-gradient-to-r from-viverblue to-viverblue-light hover:from-viverblue/90 hover:to-viverblue-light/90 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 text-lg"
                        size="lg"
                      >
                        <CheckCircle2 className="h-5 w-5 mr-2" />
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
  );
};

export default SolutionImplementation;
