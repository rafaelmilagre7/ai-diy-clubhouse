
import { useState, useCallback, useEffect, useRef } from "react";
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
import { 
  isApiTimeout, 
  extractErrorMessage, 
  isSafeToAbort,
  resetTrailState,
  detectTrailIssue,
  isCriticalTimeout
} from "@/hooks/implementation/useImplementationTrail.utils";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useLogging } from "@/hooks/useLogging";

const TrailGeneration = () => {
  const navigate = useNavigate();
  const { progress, refreshProgress } = useProgress();
  const { log, logError } = useLogging();
  const { 
    trail, 
    isLoading, 
    generateImplementationTrail, 
    refreshTrail,
    clearTrail,
    hasContent,
    error: trailError
  } = useImplementationTrail();
  
  const [generatingTrail, setGeneratingTrail] = useState(false);
  const [showMagicExperience, setShowMagicExperience] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState<string | undefined>();
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const criticalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoadRef = useRef(true);

  // Registrar evento
  useEffect(() => {
    log("trail_generation_page_loaded", { 
      timestamp: new Date().toISOString(),
      userId: "current_user",
      hasExistingTrail: hasContent
    });
  }, []);

  // Verificar se temos trilha ao carregar e obter URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autoGenerate = urlParams.get('autoGenerate') === 'true';
    const firstLoad = isFirstLoadRef.current;
    
    const loadInitialTrail = async () => {
      // Cancelar qualquer operação anterior ainda em andamento
      if (abortControllerRef.current && isSafeToAbort(loadStartTime)) {
        console.log("Abortando operação anterior antes de iniciar nova");
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      abortControllerRef.current = new AbortController();
      
      try {
        // Rastrear início do carregamento
        setLoadStartTime(Date.now());
        setLoadingError(false);
        setLoadingTimeout(false);
        setAttemptCount(prev => prev + 1);
        
        if (autoGenerate && progress && firstLoad) {
          isFirstLoadRef.current = false;
          console.log("Auto-gerando trilha com dados do onboarding:", progress);
          await startTrailGeneration(progress);
        } else {
          log("loading_trail_data", { attemptCount: attemptCount + 1 });
          
          const trailData = await refreshTrail(true);
          
          // Se não temos trilha e autoGenerate está ativado, gerar automaticamente
          if ((!trailData || !hasContent) && autoGenerate && firstLoad) {
            isFirstLoadRef.current = false;
            await refreshProgress();
            console.log("Sem trilha existente, gerando nova trilha automaticamente");
            await startTrailGeneration();
          }
        }
        
        setLoadStartTime(null);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log("Operação abortada");
          return;
        }
        
        logError("load_initial_trail_error", error);
        console.error("Erro ao carregar trilha inicial:", error);
        setErrorDetails(extractErrorMessage(error));
        setLoadingError(true);
        setLoadStartTime(null);
      }
    };
    
    loadInitialTrail();
    
    // Configurar verificação de timeout
    timeoutRef.current = setTimeout(() => {
      if ((isLoading || generatingTrail) && loadStartTime) {
        const loadDuration = Date.now() - loadStartTime;
        if (loadDuration > 12000) {
          console.warn("Timeout detectado na carga de trilha após", loadDuration, "ms");
          setLoadingTimeout(true);
          
          // Registrar evento de timeout
          log("trail_loading_timeout", { 
            loadDuration, 
            attemptCount: attemptCount + 1 
          });
        }
      }
    }, 12000);
    
    // Configurar verificação de timeout crítico
    criticalTimeoutRef.current = setTimeout(() => {
      if ((isLoading || generatingTrail) && loadStartTime && isCriticalTimeout(loadStartTime)) {
        console.error("Timeout crítico na carga de trilha");
        setLoadingTimeout(true);
        setGeneratingTrail(false);
        setLoadStartTime(null);
        
        // Tentar limpar estado
        clearTrail()
          .then(() => console.log("Trilha limpa após timeout crítico"))
          .catch(err => console.error("Erro ao limpar trilha após timeout:", err));
        
        // Registrar evento de timeout crítico
        logError("critical_loading_timeout", { 
          loadDuration: Date.now() - (loadStartTime || 0), 
          attemptCount: attemptCount + 1 
        });
      }
    }, 25000);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (criticalTimeoutRef.current) {
        clearTimeout(criticalTimeoutRef.current);
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [refreshTrail, hasContent, refreshProgress, attemptCount, loadStartTime]);

  // Observar mudanças de erro da implementação
  useEffect(() => {
    if (trailError) {
      console.error("Erro detectado na trilha:", trailError);
      setErrorDetails(extractErrorMessage(trailError));
      setLoadingError(true);
      
      // Registrar erro
      logError("trail_error_detected", {
        errorDetails: extractErrorMessage(trailError),
        attemptCount
      });
    }
  }, [trailError]);

  // Verificar timeout durante a geração
  useEffect(() => {
    if (generatingTrail && loadStartTime && isApiTimeout(loadStartTime)) {
      console.warn("Timeout detectado na geração da trilha");
      setLoadingTimeout(true);
      setGeneratingTrail(false);
      
      // Registrar evento
      log("trail_generation_timeout", { 
        loadDuration: Date.now() - loadStartTime 
      });
    }
  }, [generatingTrail, loadStartTime]);

  const startTrailGeneration = async (onboardingData = null) => {
    // Cancelar qualquer operação anterior ainda em andamento
    if (abortControllerRef.current && isSafeToAbort(loadStartTime)) {
      console.log("Abortando operação anterior antes de gerar trilha");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    abortControllerRef.current = new AbortController();
    
    setLoadingError(false);
    setLoadingTimeout(false);
    setShowMagicExperience(true);
    setGeneratingTrail(true);
    setLoadStartTime(Date.now());
    setErrorDetails(undefined);
    
    try {
      // Limpar qualquer trilha existente para evitar dados parciais
      await clearTrail(); 
      
      log("starting_trail_generation", { hasOnboardingData: !!onboardingData });
      console.log("Iniciando geração da trilha");
      
      await generateImplementationTrail(onboardingData);
      
      toast.success("Trilha personalizada gerada com sucesso!");
      log("trail_generation_success", {});
      setLoadStartTime(null);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("Geração de trilha abortada");
        return;
      }
      
      logError("trail_generation_error", error);
      console.error("Erro ao gerar trilha:", error);
      setLoadingError(true);
      setErrorDetails(extractErrorMessage(error));
      toast.error("Erro ao gerar trilha. Tente novamente.");
    } finally {
      setGeneratingTrail(false);
      setLoadStartTime(null);
      abortControllerRef.current = null;
    }
  };

  const handleForceRefresh = useCallback(async () => {
    // Cancelar qualquer operação anterior ainda em andamento
    if (abortControllerRef.current && isSafeToAbort(loadStartTime)) {
      console.log("Abortando operação anterior antes de forçar refresh");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    abortControllerRef.current = new AbortController();
    
    setAttemptCount(prev => prev + 1);
    setLoadingError(false);
    setLoadingTimeout(false);
    setLoadStartTime(Date.now());
    setErrorDetails(undefined);
    
    log("force_refreshing_trail", { attemptCount: attemptCount + 1 });
    
    try {
      toast.info("Recarregando dados...");
      
      // Tentar recarregar a trilha
      await refreshTrail(true);
      toast.success("Trilha recarregada com sucesso!");
      
      // Se ainda não temos conteúdo após o refresh, pode ser necessário regenerar
      if (!hasContent && attemptCount > 1) {
        console.log("Refresh não recuperou a trilha, tentando novamente");
        setTimeout(() => refreshTrail(true), 1000);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("Recarga abortada");
        return;
      }
      
      logError("force_refresh_error", error);
      console.error("Erro ao recarregar trilha:", error);
      setErrorDetails(extractErrorMessage(error));
      setLoadingError(true);
      setLoadStartTime(null);
    } finally {
      setLoadStartTime(null);
      abortControllerRef.current = null;
    }
  }, [clearTrail, refreshTrail, attemptCount, hasContent]);

  const handleMagicFinish = () => {
    setShowMagicExperience(false);
  };

  const handleBackToOnboarding = () => {
    navigate("/onboarding");
  };

  const handleResetData = async () => {
    try {
      setLoadingError(false);
      setLoadingTimeout(false);
      setLoadStartTime(Date.now());
      
      log("resetting_trail_data", {});
      
      // Primeiro limpar a trilha existente
      await clearTrail();
      toast.info("Dados limpos, reiniciando...");
      
      // Aguardar um pouco antes de tentar novamente
      setTimeout(() => {
        refreshTrail(true)
          .then(() => {
            toast.success("Dados reiniciados com sucesso");
            setLoadStartTime(null);
          })
          .catch(error => {
            logError("reset_data_error", error);
            setErrorDetails(extractErrorMessage(error));
            setLoadingError(true);
            setLoadStartTime(null);
          });
      }, 1000);
    } catch (error) {
      logError("reset_data_failed", error);
      console.error("Erro ao resetar dados:", error);
      setErrorDetails(extractErrorMessage(error));
      setLoadingError(true);
      setLoadStartTime(null);
    }
  };

  // Mostrar estado de carregamento
  if (isLoading || generatingTrail) {
    return (
      <TrailGenerationHeader>
        <TrailLoadingState 
          attemptCount={attemptCount} 
          onForceRefresh={handleForceRefresh} 
          loadStartTime={loadStartTime}
        />
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
          onResetData={handleResetData}
          attemptCount={attemptCount}
          errorDetails={errorDetails}
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
                onClick={() => startTrailGeneration()}
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
              onClick={() => startTrailGeneration()}
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
