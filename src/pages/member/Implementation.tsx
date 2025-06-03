
import React from "react";
import { useImplementationData } from "@/hooks/useImplementationData";
import { useImplementationProgress } from "@/hooks/useImplementationProgress";
import { ModuleContent } from "@/components/implementation/ModuleContent";
import { ImplementationNotFound } from "@/components/implementation/ImplementationNotFound";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { StepProgressBar } from "@/components/implementation/StepProgressBar";
import { useLogging } from "@/hooks/useLogging";

const Implementation = () => {
  const { solution, progress, loading } = useImplementationData();
  const { log } = useLogging();
  
  if (loading) {
    return <LoadingScreen message="Carregando implementação..." />;
  }

  if (!solution) {
    return <ImplementationNotFound />;
  }

  log("Renderizando Implementation", { 
    solutionId: solution.id,
    hasProgress: !!progress
  });

  // Criar lista de steps baseada nas abas da solução
  const steps = ["Ferramentas", "Materiais", "Vídeos", "Checklist", "Concluir"];
  const currentStep = 0; // Por enquanto, sempre começa no primeiro step

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <ImplementationHeader 
        solution={solution}
        progress={progress}
      />
      
      <StepProgressBar
        steps={steps}
        currentStep={currentStep}
        completedSteps={[]}
        className="mb-8"
      />
      
      <ModuleContent
        solution={solution}
        onComplete={() => {
          log("Implementation step completed", { solutionId: solution.id });
        }}
        onError={(error) => {
          console.error("Implementation error:", error);
        }}
      />
    </div>
  );
};

export default Implementation;
