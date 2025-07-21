
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionTabs } from "@/hooks/useSolutionTabs";
import { WizardHeader } from "./WizardHeader";
import { WizardTabs } from "./WizardTabs";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { useLogging } from "@/hooks/useLogging";
import { PageTransition } from "@/components/transitions/PageTransition";

const SolutionImplementationWizard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { log, logError } = useLogging();
  
  // Fetch solution data
  const { solution, loading, error } = useSolutionData(id);
  
  // Initialize wizard tabs
  const {
    activeTab,
    setActiveTab,
    availableTabs,
    hasAnyContent
  } = useSolutionTabs(solution);

  // Log wizard initialization
  useEffect(() => {
    if (solution) {
      log("Implementation wizard started", { 
        solution_id: solution.id, 
        solution_title: solution.title,
        available_tabs: availableTabs.length,
        tabs_with_content: availableTabs.filter(t => t.hasContent).length
      });
    }
  }, [solution, availableTabs, log]);

  if (loading) {
    return <LoadingScreen message="Carregando guia de implementação..." />;
  }

  if (error || !solution) {
    logError("Solution not found for implementation", { id, error });
    return <SolutionNotFound />;
  }

  // Calculate overall progress
  const tabsWithContent = availableTabs.filter(tab => tab.hasContent).length;
  const totalTabs = availableTabs.length;
  const progressPercentage = totalTabs > 0 ? (tabsWithContent / totalTabs) * 100 : 0;

  // Handle navigation
  const handleComplete = () => {
    log("Implementation wizard completed", { 
      solution_id: solution.id,
      tabs_explored: availableTabs.length
    });
    navigate(`/solution/${solution.id}`);
  };

  const handleGoBack = () => {
    navigate(`/solution/${solution.id}`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        {/* Fixed Header */}
        <WizardHeader
          solution={solution}
          progressPercentage={progressPercentage}
          onBack={handleGoBack}
          onComplete={handleComplete}
        />

        {/* Main Content */}
        <div className="pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-4">
            {hasAnyContent ? (
              <WizardTabs
                solution={solution}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                availableTabs={availableTabs}
              />
            ) : (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-neutral-200 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-neutral-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                  Solução em Preparação
                </h2>
                <p className="text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                  Esta solução está sendo preparada com conteúdo detalhado para implementação. 
                  Em breve você terá acesso a passos específicos, checklists e orientações completas.
                </p>
                <button
                  onClick={handleGoBack}
                  className="mt-8 px-6 py-3 bg-viverblue text-white rounded-lg hover:bg-viverblue-dark transition-colors"
                >
                  Voltar às Soluções
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SolutionImplementationWizard;
