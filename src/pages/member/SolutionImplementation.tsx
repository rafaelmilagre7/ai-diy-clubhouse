
import React from "react";
import { useModuleImplementation } from "@/hooks/useModuleImplementation";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ModuleContent } from "@/components/implementation/ModuleContent";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { ImplementationFooter } from "@/components/implementation/ImplementationFooter";
import { NotFoundContent } from "@/components/implementation/NotFoundContent";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SolutionImplementation = () => {
  const navigate = useNavigate();
  
  const {
    solution,
    modules,
    currentModule,
    loading,
    moduleIdx,
    handleComplete,
    handlePrevious,
    calculateProgress
  } = useModuleImplementation();
  
  // Adicionar atalhos de teclado para navegação
  useHotkeys('ArrowRight', () => {
    if (moduleIdx < modules.length - 1) {
      handleComplete();
      toast.success("Avançando para o próximo módulo");
    }
  }, [moduleIdx, modules, handleComplete]);
  
  useHotkeys('ArrowLeft', () => {
    handlePrevious();
    if (moduleIdx > 0) {
      toast.success("Voltando para o módulo anterior");
    }
  }, [moduleIdx, handlePrevious]);
  
  useHotkeys('Escape', () => {
    if (solution) {
      navigate(`/solution/${solution.id}`);
      toast.success("Voltando para os detalhes da solução");
    } else {
      navigate("/dashboard");
    }
  }, [solution, navigate]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!solution || !currentModule) {
    return <NotFoundContent />;
  }
  
  return (
    <div className="pb-20 min-h-screen bg-slate-50">
      {/* Header section */}
      <ImplementationHeader
        solution={solution}
        moduleIdx={moduleIdx}
        modulesLength={modules.length}
        calculateProgress={calculateProgress}
      />
      
      {/* Module content */}
      <div className="container mt-6 bg-white p-6 rounded-lg shadow-sm">
        <ModuleContent 
          module={currentModule} 
          onComplete={handleComplete} 
        />
      </div>
      
      {/* Navigation footer */}
      <ImplementationFooter
        moduleIdx={moduleIdx}
        modulesLength={modules.length}
        handlePrevious={handlePrevious}
        handleComplete={handleComplete}
      />
    </div>
  );
};

export default SolutionImplementation;
