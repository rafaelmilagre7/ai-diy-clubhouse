
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { ImplementationNavigation } from "@/components/implementation/ImplementationNavigation";
import { ImplementationProgress } from "@/components/implementation/ImplementationProgress";
import { ModuleContent } from "@/components/implementation/ModuleContent";
import { ImplementationConfirmationModal } from "@/components/implementation/ImplementationConfirmationModal";
import { Solution, Module } from "@/lib/supabase";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionSteps } from "@/hooks/implementation/useSolutionSteps";
import { useProgressTracking } from "@/hooks/implementation/useProgressTracking";
import { useImplementationNavigation } from "@/hooks/implementation/useImplementationNavigation";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useLogging } from "@/hooks/useLogging";
import { PageTransition } from "@/components/transitions/PageTransition";

const SolutionImplementation = () => {
  const { id, moduleIdx } = useParams<{ id: string; moduleIdx: string }>();
  const moduleIndex = parseInt(moduleIdx || "0");
  const { log, logError } = useLogging();
  
  console.log("🎯 SOLUTION IMPLEMENTATION CARREGADO:");
  console.log("- Solution ID:", id);
  console.log("- Module Index:", moduleIndex);
  console.log("- URL Params:", { id, moduleIdx });

  // Fetch solution data
  const { solution, loading: solutionLoading, progress } = useSolutionData(id);
  console.log("📊 SOLUTION DATA:", { 
    solution: solution?.title,
    solutionLoading,
    progress: progress ? "exists" : "null"
  });

  // Generate dynamic steps based on solution data
  const modules = useSolutionSteps(solution);
  const modulesLoading = false;
  console.log("🔧 MODULES DATA:", {
    totalModules: modules.length,
    modulesLoading,
    moduleTypes: modules.map(m => m.type)
  });

  // State for tracking completed modules
  const [completedModules, setCompletedModules] = useState<number[]>(
    progress?.completed_modules || []
  );

  // Progress tracking functionality
  const {
    moduleIdx: currentModuleIdx,
    isCompleting,
    hasInteracted,
    showConfirmationModal,
    setShowConfirmationModal,
    handleMarkAsCompleted,
    handleConfirmImplementation,
    calculateProgress,
    setModuleInteraction
  } = useProgressTracking(progress, completedModules, setCompletedModules, modules.length);

  // Navigation functionality
  const {
    handleComplete,
    handlePrevious,
    handleNavigateToModule
  } = useImplementationNavigation();

  // Update completed modules when progress changes
  useEffect(() => {
    if (progress?.completed_modules) {
      console.log("🔄 Atualizando completed modules:", progress.completed_modules);
      setCompletedModules(progress.completed_modules);
    }
  }, [progress]);

  // Loading state
  if (solutionLoading || modulesLoading) {
    console.log("⏳ Carregando dados...");
    return <LoadingScreen message="Carregando implementação..." />;
  }

  // Error states
  if (!solution) {
    console.error("❌ Solução não encontrada");
    logError("Solution not found in implementation", { id });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Solução não encontrada</h2>
          <p className="text-muted-foreground">A solução que você está tentando implementar não foi encontrada.</p>
        </Card>
      </div>
    );
  }

  if (modules.length === 0) {
    console.error("❌ Nenhum módulo gerado");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Erro ao carregar módulos</h2>
          <p className="text-muted-foreground">Não foi possível carregar os módulos de implementação.</p>
        </Card>
      </div>
    );
  }

  // Get current module
  const currentModule = modules[moduleIndex] || modules[0];
  console.log("📍 CURRENT MODULE:", {
    index: moduleIndex,
    module: currentModule ? {
      id: currentModule.id,
      type: currentModule.type,
      title: currentModule.title
    } : "not found"
  });

  if (!currentModule) {
    console.error("❌ Módulo atual não encontrado");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Módulo não encontrado</h2>
          <p className="text-muted-foreground">O módulo que você está tentando acessar não existe.</p>
        </Card>
      </div>
    );
  }

  // Handle module completion
  const handleModuleComplete = () => {
    console.log("✅ Módulo completado:", currentModule.id);
    log("Module completed", { 
      solutionId: id,
      moduleIndex,
      moduleId: currentModule.id,
      moduleType: currentModule.type
    });
    
    handleMarkAsCompleted();
  };

  // Navigation modules for sidebar
  const navigationModules = modules.map((module, index) => ({
    id: module.id,
    title: module.title,
    type: module.type,
    completed: completedModules.includes(index),
    current: index === moduleIndex
  }));

  // Calculate progress percentage
  const progressPercentage = calculateProgress();
  
  console.log("📈 RENDER STATE:", {
    currentModuleIndex: moduleIndex,
    totalModules: modules.length,
    completedModules,
    progressPercentage,
    hasInteracted,
    isCompleting
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        {/* Aurora Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-viverblue/8 via-transparent to-viverblue-dark/12" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-viverblue/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-viverblue-dark/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        </div>

        <div className="relative max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left sidebar - Navigation */}
            <div className="lg:col-span-1 space-y-6">
              <ImplementationNavigation
                modules={navigationModules}
                solutionId={id!}
                currentModule={moduleIndex}
              />
              
              <ImplementationProgress
                currentModule={moduleIndex}
                totalModules={modules.length}
                completedModules={completedModules}
                progressPercentage={progressPercentage}
              />
            </div>

            {/* Main content */}
            <div className="lg:col-span-3">
              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
                <ImplementationHeader
                  solution={solution}
                  currentModuleIndex={moduleIndex}
                  totalModules={modules.length}
                  currentModule={{
                    id: currentModule.id,
                    type: currentModule.type,
                    solution_id: solution.id,
                    content: currentModule.content,
                    title: currentModule.title,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  } as Module}
                />
                
                <CardContent className="p-8">
                  <ModuleContent
                    module={{
                      id: currentModule.id,
                      type: currentModule.type,
                      solution_id: solution.id,
                      content: currentModule.content,
                      title: currentModule.title,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    } as Module}
                    onComplete={handleModuleComplete}
                    onError={(error) => {
                      console.error("❌ Erro no módulo:", error);
                      logError("Module error", error);
                    }}
                  />
                </CardContent>

              </Card>
            </div>
          </div>
        </div>

        {/* Completion Confirmation Modal */}
        <ImplementationConfirmationModal
          solution={solution}
          isOpen={showConfirmationModal}
          isSubmitting={isCompleting}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleConfirmImplementation}
        />
      </div>
    </PageTransition>
  );
};

export default SolutionImplementation;
