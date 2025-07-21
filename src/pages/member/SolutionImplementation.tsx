
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useSolutionModules } from "@/hooks/implementation/useSolutionModules";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useProgressTracking } from "@/hooks/implementation/useProgressTracking";
import { ModuleContent } from "@/components/implementation/ModuleContent";
import { ImplementationNavigation } from "@/components/implementation/ImplementationNavigation";
import { ImplementationProgress } from "@/components/implementation/ImplementationProgress";
import LoadingScreen from "@/components/common/LoadingScreen";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";
import { useState, useEffect } from "react";

const SolutionImplementation = () => {
  const { id, moduleIndex } = useParams<{ id: string; moduleIndex: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { log, logError } = useLogging();
  
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  
  // Fetch solution data
  const { solution, loading: solutionLoading, progress } = useSolutionData(id);
  
  // Generate dynamic modules based on solution data
  const { modules, loading: modulesLoading, totalModules } = useSolutionModules(solution);
  
  // Progress tracking
  const {
    moduleIdx,
    isCompleting,
    hasInteracted,
    showConfirmationModal,
    setShowConfirmationModal,
    handleMarkAsCompleted,
    handleConfirmImplementation,
    calculateProgress,
    setModuleInteraction,
    requireUserConfirmation,
    setRequireUserConfirmation
  } = useProgressTracking(
    progress,
    completedModules,
    setCompletedModules,
    totalModules
  );

  // Load completed modules from progress
  useEffect(() => {
    if (progress?.completed_modules) {
      setCompletedModules(progress.completed_modules);
    }
  }, [progress]);

  // Get current module
  const currentModule = modules[moduleIdx];

  // Loading state
  if (solutionLoading || modulesLoading) {
    return <LoadingScreen message="Carregando implementação..." />;
  }

  // Error state
  if (!solution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Solução não encontrada</h1>
          <Button onClick={() => navigate("/solutions")}>
            Voltar para Soluções
          </Button>
        </div>
      </div>
    );
  }

  if (!currentModule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Módulo não encontrado</h1>
          <Button onClick={() => navigate(`/solutions/${id}`)}>
            Voltar para Solução
          </Button>
        </div>
      </div>
    );
  }

  // Handle module completion
  const handleModuleComplete = () => {
    log("Módulo marcado como completo pelo usuário", { 
      moduleId: currentModule.id,
      moduleType: currentModule.type 
    });
    setModuleInteraction(true);
    handleMarkAsCompleted();
  };

  log("Renderizando página de implementação", {
    solutionId: solution.id,
    moduleIndex: moduleIdx,
    currentModule: currentModule?.type,
    totalModules,
    hasProgress: !!progress
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Aurora Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-viverblue/5 via-transparent to-viverblue-dark/8" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-viverblue/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-viverblue-dark/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/solutions/${id}`)}
                  className="text-neutral-300 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Solução
                </Button>
                <div className="h-6 w-px bg-white/20" />
                <div>
                  <h1 className="text-lg font-semibold text-white truncate max-w-md">
                    {solution.title}
                  </h1>
                  <p className="text-sm text-neutral-400">
                    {currentModule.title}
                  </p>
                </div>
              </div>
              
              <ImplementationProgress 
                currentModule={moduleIdx}
                totalModules={totalModules}
                completedModules={completedModules}
                progressPercentage={calculateProgress()}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <ImplementationNavigation
                modules={modules.map((module, index) => ({
                  id: module.id,
                  title: module.title,
                  type: module.type,
                  completed: completedModules.includes(index),
                  current: index === moduleIdx
                }))}
                solutionId={id!}
                currentModule={moduleIdx}
              />
            </div>

            {/* Module Content */}
            <div className="lg:col-span-3">
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 shadow-2xl">
                <ModuleContent
                  module={{
                    id: currentModule.id,
                    type: currentModule.type,
                    solution_id: solution.id,
                    content: currentModule.content,
                    title: currentModule.title,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }}
                  onComplete={handleModuleComplete}
                  onError={(error) => {
                    logError("Erro no módulo de implementação", error);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionImplementation;
