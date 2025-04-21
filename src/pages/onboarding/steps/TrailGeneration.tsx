
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrailGenerationHeader } from "@/components/onboarding/TrailGeneration/TrailGenerationHeader";
import { TrailGuidedExperience } from "@/components/onboarding/TrailGuidedExperience";
import { TrailMagicExperience } from "@/components/onboarding/TrailMagicExperience";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { TrailLoadingState } from "@/components/onboarding/TrailGeneration/TrailLoadingState";
import { TrailErrorState } from "@/components/onboarding/TrailGeneration/TrailErrorState";

const TrailGeneration = () => {
  const navigate = useNavigate();
  const { 
    trail, 
    isLoading, 
    generateImplementationTrail, 
    refreshTrail,
    clearTrail,
    hasContent 
  } = useImplementationTrail();
  
  const [generatingTrail, setGeneratingTrail] = useState(false);
  const [showMagicExperience, setShowMagicExperience] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Verificar se temos trilha ao carregar
  useEffect(() => {
    const loadInitialTrail = async () => {
      try {
        setAttemptCount(prev => prev + 1);
        await refreshTrail(true);
      } catch (error) {
        console.error("Erro ao carregar trilha inicial:", error);
      }
    };
    
    loadInitialTrail();
    
    // Timeout para evitar espera infinita
    const timeout = setTimeout(() => {
      if (isLoading) {
        setLoadingTimeout(true);
      }
    }, 12000);
    
    return () => clearTimeout(timeout);
  }, [refreshTrail]);

  const startTrailGeneration = async () => {
    setLoadingError(false);
    setLoadingTimeout(false);
    setShowMagicExperience(true);
    setGeneratingTrail(true);
    
    try {
      await generateImplementationTrail();
      toast.success("Trilha personalizada gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar trilha:", error);
      setLoadingError(true);
      toast.error("Erro ao gerar trilha. Tente novamente.");
    } finally {
      setGeneratingTrail(false);
    }
  };

  const handleForceRefresh = useCallback(async () => {
    setAttemptCount(prev => prev + 1);
    setLoadingError(false);
    setLoadingTimeout(false);
    
    try {
      // Limpar trilha existente para forçar reload completo
      await clearTrail();
      
      // Pequeno delay para garantir limpeza
      setTimeout(async () => {
        await refreshTrail(true);
        toast.success("Trilha recarregada com sucesso!");
      }, 500);
    } catch (error) {
      console.error("Erro ao recarregar trilha:", error);
      setLoadingError(true);
    }
  }, [clearTrail, refreshTrail]);

  const handleMagicFinish = () => {
    setShowMagicExperience(false);
  };

  const handleBackToOnboarding = () => {
    navigate("/onboarding");
  };

  // Mostrar estado de carregamento
  if (isLoading || generatingTrail) {
    return (
      <TrailGenerationHeader>
        <TrailLoadingState attemptCount={attemptCount} onForceRefresh={handleForceRefresh} />
      </TrailGenerationHeader>
    );
  }

  // Mostrar estado de erro
  if (loadingError || loadingTimeout) {
    return (
      <TrailGenerationHeader>
        <TrailErrorState
          loadingTimeout={loadingTimeout}
          onRegenerate={startTrailGeneration}
          onForceRefresh={handleForceRefresh}
          onGoBack={handleBackToOnboarding}
        />
      </TrailGenerationHeader>
    );
  }

  return (
    <TrailGenerationHeader>
      <div className="max-w-5xl mx-auto p-4">
        {showMagicExperience ? (
          <TrailMagicExperience onFinish={handleMagicFinish} />
        ) : hasContent ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" onClick={handleBackToOnboarding}>
                Voltar para Onboarding
              </Button>
              <Button
                className="bg-[#0ABAB5] text-white"
                onClick={startTrailGeneration}
                disabled={generatingTrail}
              >
                {generatingTrail ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando Nova Trilha...
                  </>
                ) : "Gerar Nova Trilha"}
              </Button>
            </div>
            
            <TrailGuidedExperience autoStart={true} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <h2 className="text-2xl font-bold text-[#0ABAB5]">
              Vamos criar sua trilha personalizada!
            </h2>
            <p className="text-gray-600 text-center max-w-lg">
              Com base nas informações que você forneceu, o Milagrinho irá gerar uma trilha personalizada 
              com as melhores soluções para o seu negócio.
            </p>
            <Button
              className="bg-[#0ABAB5] text-white px-8 py-6 text-lg"
              onClick={startTrailGeneration}
              disabled={generatingTrail}
              size="lg"
            >
              {generatingTrail ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Gerando Trilha...
                </>
              ) : "Gerar Minha Trilha Personalizada"}
            </Button>
          </div>
        )}
      </div>
    </TrailGenerationHeader>
  );
};

export default TrailGeneration;
