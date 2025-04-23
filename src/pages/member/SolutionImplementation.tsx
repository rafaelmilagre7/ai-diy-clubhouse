import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useLogging } from "@/hooks/useLogging";
import { useModuleImplementation } from "@/hooks/implementation/useModuleImplementation";
import { useProgressTracking } from "@/hooks/implementation/useProgressTracking";
import { useModuleChangeTracking } from "@/hooks/implementation/useModuleChangeTracking";
import { useSolutionCompletion } from "@/hooks/implementation/useSolutionCompletion";
import { useImplementationShortcuts } from "@/hooks/implementation/useImplementationShortcuts";
import { adaptSolutionType, adaptProgressType } from "@/utils/typeAdapters";

import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { NotFoundContent } from "@/components/implementation/NotFoundContent";
import ImplementationTabsNavigation from "@/components/implementation/ImplementationTabsNavigation";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { ImplementationProgress } from "@/components/implementation/ImplementationProgress";
import { ModuleContent } from "@/components/implementation/ModuleContent";
import { ModulesList } from "@/components/implementation/ModulesList";
import { WizardStepProgress } from "@/components/implementation/WizardStepProgress";
import { KeyboardShortcuts } from "@/components/implementation/KeyboardShortcuts";
import { ImplementationConfirmationModal } from "@/components/implementation/ImplementationConfirmationModal";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const SolutionImplementation = () => {
  const { id, moduleIdx: moduleIdxParam } = useParams<{ id: string; moduleIdx: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { log } = useLogging("SolutionImplementation");
  
  const [activeTab, setActiveTab] = useState("overview");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  const moduleIdx = moduleIdxParam ? parseInt(moduleIdxParam, 10) : 0;
  
  const { solution: supaSolution, loading, error, progress: supaProgress, notFoundError } = useSolutionData(id || "");
  
  const solution = supaSolution ? adaptSolutionType(supaSolution) : null;
  const progress = supaProgress ? adaptProgressType(supaProgress) : null;
  
  const { currentModule, modules, isLastModule, handleModuleChange } = useModuleImplementation(
    solution, moduleIdx
  );
  
  const { 
    markModuleCompleted, 
    completedModules, 
    setCompletedModules,
    completionPercentage,
    calculateProgress,
    handleConfirmImplementation: progressTrackerConfirmImplementation,
    isCompleting
  } = useProgressTracking(
    id || "", 
    progress, 
    moduleIdx,
    modules?.length || 8
  );
  
  const { completeSolution } = useSolutionCompletion(id || "");
  
  const { trackModuleView } = useModuleChangeTracking(id || "", moduleIdx);
  
  useImplementationShortcuts({
    onNext: () => moduleIdx < (modules?.length || 0) - 1 && handleModuleChange(moduleIdx + 1),
    onPrevious: () => moduleIdx > 0 && handleModuleChange(moduleIdx - 1),
    isFirstModule: moduleIdx === 0,
    isLastModule
  });
  
  useEffect(() => {
    if (!loading && !user) {
      toast.error("Você precisa estar logado para acessar esta página");
      navigate("/login", { state: { returnTo: `/implement/${id}/${moduleIdx}` } });
    }
  }, [user, loading, id, moduleIdx, navigate]);
  
  useEffect(() => {
    if (solution && modules && modules.length > 0 && currentModule) {
      trackModuleView(moduleIdx, currentModule.id);
    }
  }, [solution, moduleIdx, modules, currentModule, trackModuleView]);
  
  const handleConfirmCompletion = () => {
    setShowCompletionModal(true);
  };
  
  const handleConfirmImplementation = async () => {
    const success = await completeSolution();
    if (success) {
      toast.success("Parabéns! Você concluiu esta implementação!");
      navigate(`/solution/${id}`);
    } else {
      toast.error("Não foi possível concluir sua implementação. Tente novamente.");
    }
    setShowCompletionModal(false);
  };
  
  if (error) {
    return <NotFoundContent />;
  }
  
  if (notFoundError || !solution) {
    return <SolutionNotFound />;
  }
  
  return (
    <div className="container max-w-7xl mx-auto pb-10 animate-fade-in">
      <div className="space-y-6">
        <ImplementationHeader 
          solution={solution} 
          currentModule={moduleIdx}
          totalModules={modules?.length || 1}
        />
        
        <ImplementationProgress 
          currentStep={moduleIdx}
          totalSteps={modules?.length || 1}
          completedModules={completedModules}
        />
        
        <div className="mt-4">
          <ImplementationTabsNavigation 
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            isLastStep={isLastModule}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <ModulesList 
              modules={modules}
              currentModuleIdx={moduleIdx}
              onModuleChange={handleModuleChange}
              completedModules={completedModules}
            />
          </div>
          
          <div className="md:col-span-3">
            <Card className="p-6">
              {currentModule && (
                <ModuleContent 
                  module={currentModule}
                  onComplete={() => markModuleCompleted(moduleIdx)}
                />
              )}
              
              <WizardStepProgress 
                currentStep={moduleIdx}
                totalSteps={modules?.length || 1}
                onPrevious={() => handleModuleChange(moduleIdx - 1)}
                onNext={() => handleModuleChange(moduleIdx + 1)}
                onComplete={() => markModuleCompleted(moduleIdx)}
                isFirstStep={moduleIdx === 0}
                isLastStep={isLastModule}
                onFinish={handleConfirmCompletion}
              />
            </Card>
          </div>
        </div>
        
        <KeyboardShortcuts />
      </div>
      
      <ImplementationConfirmationModal 
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onConfirm={handleConfirmImplementation}
        isLoading={isCompleting}
      />
    </div>
  );
};

export default SolutionImplementation;
