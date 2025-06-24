
import { useParams, useLocation } from "react-router-dom";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionInteractions } from "@/hooks/useSolutionInteractions";
import { SolutionBackButton } from "@/components/solution/SolutionBackButton";
import { SolutionHeaderSection } from "@/components/solution/SolutionHeaderSection";
import { SolutionSidebar } from "@/components/solution/SolutionSidebar";
import { SolutionMobileActions } from "@/components/solution/SolutionMobileActions";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { useEffect, useState } from "react";
import { useLogging } from "@/hooks/useLogging";
import { PageTransition } from "@/components/transitions/PageTransition";
import { FadeTransition } from "@/components/transitions/FadeTransition";
import { SuccessCard } from "@/components/celebration/SuccessCard";
import { Card, CardContent } from "@/components/ui/card";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { log, logError } = useLogging();
  const [showStartSuccess, setShowStartSuccess] = useState(false);
  
  // Fetch solution data with progress
  const { solution, loading, error, progress } = useSolutionData(id);
  
  // Solution interaction handlers
  const { 
    initializing, 
    startImplementation: originalStartImplementation, 
    continueImplementation, 
    toggleFavorite, 
    downloadMaterials 
  } = useSolutionInteractions(id, progress);

  // Wrapped start implementation to show success animation
  const startImplementation = async () => {
    const result = await originalStartImplementation();
    if (result) {
      setShowStartSuccess(true);
      setTimeout(() => setShowStartSuccess(false), 3000);
    }
    return result;
  };
  
  // Log page visit
  useEffect(() => {
    if (solution) {
      log("Solution details page visited", { 
        solution_id: solution.id, 
        solution_title: solution.title,
        path: location.pathname
      });
    }
  }, [solution, location.pathname, log]);
  
  if (loading) {
    return <LoadingScreen message="Carregando detalhes da solução..." />;
  }
  
  if (!solution) {
    logError("Solution not found", { id });
    return <SolutionNotFound />;
  }
  
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto pb-12">
        {showStartSuccess && (
          <div className="fixed top-20 right-4 z-50 w-80">
            <SuccessCard
              title="Implementação Iniciada"
              message="Você começou a implementação dessa solução. Boa jornada!"
              type="step"
              onAnimationComplete={() => setShowStartSuccess(false)}
            />
          </div>
        )}
        
        <SolutionBackButton />
        
        <FadeTransition>
          <SolutionHeaderSection solution={solution} />
        </FadeTransition>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <FadeTransition delay={0.2}>
              <Card className="bg-[#151823] border border-white/5">
                <CardContent className="p-8">
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-xl font-semibold text-neutral-100 mb-4">
                      Sobre esta Solução
                    </h3>
                    <p className="text-neutral-300 leading-relaxed mb-6">
                      {solution.description || "Esta solução foi desenvolvida para otimizar seus processos e impulsionar seus resultados."}
                    </p>
                    
                    {solution.benefits && solution.benefits.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-neutral-100 mb-3">
                          Principais Benefícios
                        </h4>
                        <ul className="list-disc list-inside space-y-2">
                          {solution.benefits.map((benefit, index) => (
                            <li key={index} className="text-neutral-300">
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="bg-viverblue/10 border border-viverblue/30 rounded-lg p-6 mt-6">
                      <p className="text-neutral-200 text-center">
                        <span className="font-medium">Pronto para começar?</span>
                        <br />
                        Clique em "Implementar Solução" para acessar todos os recursos, ferramentas e guias passo a passo.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeTransition>
            
            <FadeTransition delay={0.3}>
              <SolutionMobileActions 
                solutionId={solution.id}
                progress={progress}
                startImplementation={startImplementation}
                continueImplementation={continueImplementation}
                initializing={initializing}
              />
            </FadeTransition>
          </div>
          
          <div className="md:col-span-1">
            <FadeTransition delay={0.4} direction="right">
              <SolutionSidebar 
                solution={solution}
                progress={progress}
                startImplementation={startImplementation}
                continueImplementation={continueImplementation}
                initializing={initializing}
              />
            </FadeTransition>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SolutionDetails;
