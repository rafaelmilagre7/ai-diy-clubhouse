
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

  // Carregar trilha existente ao montar o componente
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
    
    // Timeout para evitar carregamento infinito
    const timeout = setTimeout(() => {
      if (isLoading || refreshing) {
        console.log("Tempo limite excedido ao carregar trilha");
        setLoadingTimeout(true);
        toast.error("Tempo limite excedido ao carregar trilha");
      }
    }, 15000); // 15 segundos
    
    return () => clearTimeout(timeout);
    
  }, [refreshTrail]);

  // Auto-iniciar geração se chegou da página de onboarding "concluído"
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const autoGenerate = searchParams.get('autoGenerate') === 'true';
    
    if (autoGenerate && !generatingTrail && !hasContent) {
      console.log("Iniciando geração automática da trilha após conclusão do onboarding");
      startTrailGeneration();
    }
  }, []);

  // Função para iniciar a experiência mágica e gerar a trilha diretamente
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

  // Recarregar a trilha forçadamente
  const handleForceRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoadingError(false);
    setLoadingTimeout(false);
    setAttemptCount(prev => prev + 1);
    
    try {
      // Tentar limpar a trilha existente primeiro
      await clearTrail();
      
      // Aguardar um momento para garantir que a limpeza seja processada
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

  // Quando a animação terminar, mostrar a trilha gerada
  const handleMagicFinish = () => {
    setShowMagicExperience(false);
    setAutoStartGeneration(true);
  };

  // Voltar para a página de onboarding
  const handleBackToOnboarding = () => {
    navigate("/onboarding");
  };

  // Se estiver carregando
  if (isLoading || refreshing) {
    return (
      <OnboardingLayout 
        currentStep={9} 
        title="Sua Trilha Personalizada"
        backUrl="/onboarding"
      >
        <div className="flex flex-col items-center justify-center space-y-4 h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
          <p className="text-[#0ABAB5] font-medium">Carregando sua trilha personalizada...</p>
          {attemptCount > 2 && (
            <Button
              variant="outline"
              onClick={handleForceRefresh}
              size="sm"
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Forçar recarregamento
            </Button>
          )}
        </div>
      </OnboardingLayout>
    );
  }

  // Se houver erro de carregamento
  if (loadingError || loadingTimeout) {
    return (
      <OnboardingLayout 
        currentStep={9} 
        title="Sua Trilha Personalizada"
        backUrl="/onboarding"
      >
        <div className="max-w-xl mx-auto mt-8 p-6 bg-amber-50 rounded-lg border border-amber-200 flex flex-col items-center">
          <AlertCircle className="text-amber-500 h-10 w-10 mb-3" />
          <p className="text-gray-700 mb-4 text-center">
            {loadingTimeout 
              ? "O carregamento da trilha excedeu o tempo limite. Por favor, tente novamente."
              : "Ocorreu um erro ao carregar sua trilha. Por favor, tente novamente."}
          </p>
          <div className="flex justify-center gap-2">
            <Button 
              className="bg-[#0ABAB5] text-white" 
              onClick={startTrailGeneration}
            >
              Gerar Nova Trilha
            </Button>
            
            <Button
              variant="outline"
              onClick={handleForceRefresh}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleBackToOnboarding}
            >
              Voltar
            </Button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      currentStep={9} 
      title="Sua Trilha Personalizada"
      backUrl="/onboarding"
    >
      <div className="max-w-5xl mx-auto p-4">
        {showMagicExperience ? (
          <TrailMagicExperience onFinish={handleMagicFinish} />
        ) : hasContent ? (
          <>
            <div className="mb-6 flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={handleBackToOnboarding}
              >
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
    </OnboardingLayout>
  );
};

export default TrailGeneration;
