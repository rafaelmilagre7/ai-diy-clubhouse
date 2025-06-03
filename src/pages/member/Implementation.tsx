
import React from "react";
import { useParams } from "react-router-dom";
import { useImplementationFlow } from "@/hooks/implementation/useImplementationFlow";
import { ImplementationNotFound } from "@/components/implementation/ImplementationNotFound";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { OptimizedImplementationWizard } from "@/components/implementation/tab-based/OptimizedImplementationWizard";
import { SolutionDataProvider } from "@/contexts/SolutionDataContext";
import { PageTransition } from "@/components/transitions/PageTransition";

const Implementation = () => {
  const { id } = useParams<{ id: string }>();
  const {
    solution,
    progress,
    materials,
    tools,
    videos,
    loading,
    error
  } = useImplementationFlow();
  
  if (loading) {
    return <LoadingScreen message="Carregando implementação..." />;
  }

  if (error || !solution || !id) {
    return <ImplementationNotFound />;
  }

  // Criar dados fictícios para manter compatibilidade com SolutionDataProvider
  const mockSolutionData = {
    solution,
    materials,
    tools,
    videos,
    progress
  };

  return (
    <SolutionDataProvider data={mockSolutionData} isLoading={loading} error={error || null}>
      <PageTransition>
        <div className="container max-w-5xl mx-auto py-8">
          <ImplementationHeader 
            solution={solution}
            progress={progress}
          />
          
          <div className="mt-8">
            <OptimizedImplementationWizard solutionId={id} />
          </div>
        </div>
      </PageTransition>
    </SolutionDataProvider>
  );
};

export default Implementation;
