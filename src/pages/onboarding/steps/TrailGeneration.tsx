import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { TrailGuidedExperience } from "@/components/onboarding/TrailGuidedExperience";
import { TrailMagicExperience } from "@/components/onboarding/TrailMagicExperience";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { countTrailSolutions } from "@/hooks/implementation/useImplementationTrail.utils";
import { TrailGenerationHeader } from "@/components/onboarding/TrailGeneration/TrailGenerationHeader";
import { GenerationControls } from "@/components/onboarding/TrailGeneration/GenerationControls";
import { TrailLoadingState } from "@/components/onboarding/TrailGeneration/TrailLoadingState";
import { TrailErrorState } from "@/components/onboarding/TrailGeneration/TrailErrorState";

const TrailGeneration = () => {
  const navigate = useNavigate();
  const { 
    trail, 
    isLoading, 
    generateImplementationTrail, 
    hasContent, 
    refreshTrail,
    clearTrail 
  } = useImplementationTrail();
  
  const [generatingTrail, setGeneratingTrail] = useState(false);
  const [showMagicExperience, setShowMagicExperience] = useState(false);
  const [autoStartGeneration, setAutoStartGeneration] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    const loadTrail = async () => {
      try {
        setRefreshing(true);
        setAttemptCount(prev => prev + 1);
        
        const trailData = await refreshTrail(true);
        
        if (!trailData || countTrailSolutions(trailData) === 0) {
          console.log("Trilha não encontrada ou sem soluções válidas");
          if (attemptCount >= 2) {
            setLoadingError(true);
          }
        } else {
          console.log("Trilha carregada com sucesso:", countTrailSolutions(trailData), "soluções");
          setLoadingError(false);
        }
      } catch (error) {
        console.error("Erro ao carregar trilha:", error);
        if (attemptCount >= 2) {
          setLoadingError(true);
        }
      } finally {
        setRefreshing(false);
      }
    };
    
    loadTrail();
    
    const timeout = setTimeout(() => {
      if (isLoading || refreshing) {
        console.log("Tempo limite excedido ao carregar trilha");
        setLoadingTimeout(true);
        toast.error("Tempo limite excedido ao carregar trilha");
      }
    }, 15000);
    
    return () => clearTimeout(timeout);
  }, [refreshTrail]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const autoGenerate = searchParams.get('autoGenerate') === 'true';
    
    if (autoGenerate && !generatingTrail && !hasContent) {
      console.log("Iniciando geração automática da trilha após conclusão do onboarding");
      startTrailGeneration();
    }
  }, []);

  const startTrailGeneration = async () => {
    setShowMagicExperience(true);
    setGeneratingTrail(true);
    setLoadingError(false);
    setLoadingTimeout(false);
    
    try {
      await generateImplementationTrail();
      toast.success("Trilha personalizada gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar trilha:", error);
      toast.error("Ocorreu um erro ao gerar sua trilha. Tente novamente.");
      setLoadingError(true);
    } finally {
      setGeneratingTrail(false);
    }
  };

  const handleForceRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoadingError(false);
    setLoadingTimeout(false);
    setAttemptCount(prev => prev + 1);
    
    try {
      await clearTrail();
      
      setTimeout(async () => {
        await refreshTrail(true);
        toast.success("Trilha recarregada com sucesso!");
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao forçar atualização da trilha:", error);
      setLoadingError(true);
      toast.error("Erro ao recarregar a trilha. Tente novamente mais tarde.");
    } finally {
      setRefreshing(false);
    }
  }, [clearTrail, refreshTrail]);

  const handleMagicFinish = () => {
    setShowMagicExperience(false);
    setAutoStartGeneration(true);
  };

  const handleBackToOnboarding = () => {
    navigate("/onboarding");
  };

  if (isLoading || refreshing) {
    return (
      <TrailGenerationHeader>
        <TrailLoadingState attemptCount={attemptCount} onForceRefresh={handleForceRefresh} />
      </TrailGenerationHeader>
    );
  }

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
          <>
            <GenerationControls
              onGoBack={handleBackToOnboarding}
              onRegenerate={startTrailGeneration}
              generating={generatingTrail}
            />
            <TrailGuidedExperience autoStart={autoStartGeneration} />
          </>
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
