
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PersonalInfoFormFull } from "@/components/onboarding/steps/PersonalInfoFormFull";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { Button } from "@/components/ui/button";
import { TrailGenerationPanel } from "@/components/onboarding/TrailGenerationPanel";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { toast } from "sonner";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { countTrailSolutions } from "@/hooks/implementation/useImplementationTrail.utils";

const Onboarding = () => {
  const { user } = useAuth();
  const { progress, isLoading: progressLoading } = useProgress();
  const navigate = useNavigate();
  
  // Exibe painel da trilha se ela existir, exceto ao gerar agora
  const [showTrailPanel, setShowTrailPanel] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Hook da trilha
  const { 
    trail, 
    isLoading: trailLoading, 
    refreshTrail,
    hasContent,
    clearTrail 
  } = useImplementationTrail();

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Função para carregar a trilha com controle de erro
  const loadTrailData = useCallback(async (forceRefresh = true) => {
    try {
      setIsRetrying(true);
      setLoadingError(false);
      setLoadTimeout(false);
      setAttemptCount(prev => prev + 1);
      
      const startTime = Date.now();
      const trailData = await refreshTrail(forceRefresh);
      
      // Verificar explicitamente se há soluções na trilha
      if (!trailData || countTrailSolutions(trailData) === 0) {
        console.log("Trilha não encontrada ou sem soluções válidas após carregamento");
        if (attemptCount >= 2) {
          setLoadingError(true);
        }
      } else {
        console.log("Trilha carregada com sucesso:", countTrailSolutions(trailData), "soluções");
        setLoadingError(false);
      }
      
      return trailData;
    } catch (error) {
      console.error("Erro ao carregar trilha:", error);
      if (attemptCount >= 2) {
        setLoadingError(true);
      }
      return null;
    } finally {
      setIsRetrying(false);
    }
  }, [refreshTrail, attemptCount]);

  // Carregar trilha ao montar ou ao progredir onboarding
  useEffect(() => {
    loadTrailData();
    
    // Adicionar um timeout para evitar loading infinito
    const timeout = setTimeout(() => {
      if (trailLoading || isRetrying) {
        console.log("Tempo limite excedido ao carregar trilha");
        setLoadTimeout(true);
        toast.error("Tempo limite excedido ao carregar trilha");
      }
    }, 15000); // 15 segundos
    
    return () => clearTimeout(timeout);
  }, [loadTrailData]);

  // Abrir painel da trilha após completar onboarding se a trilha existir
  useEffect(() => {
    if (isOnboardingCompleted && hasContent && !trailLoading && !isRetrying) {
      setShowTrailPanel(true);
    }
  }, [isOnboardingCompleted, hasContent, trailLoading, isRetrying]);

  // Extrai primeiro nome
  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || '';

  const isOnboardingCompleted = !!progress?.is_completed;

  // Redireciona para a página de geração de trilha 
  const handleGenerateTrail = useCallback(() => {
    navigate("/onboarding/trail-generation?autoGenerate=true");
  }, [navigate]);
  
  // Limpar trilha e tentar novamente
  const handleForceRefresh = useCallback(async () => {
    setIsRetrying(true);
    setLoadingError(false);
    setLoadTimeout(false);
    
    try {
      // Tentar limpar a trilha existente primeiro
      await clearTrail();
      setShowTrailPanel(false);
      
      // Aguardar um momento para garantir que a limpeza seja processada
      setTimeout(async () => {
        await loadTrailData(true);
        setShowTrailPanel(true);
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao forçar atualização da trilha:", error);
      setLoadingError(true);
      toast.error("Erro ao recarregar a trilha. Tente novamente mais tarde.");
    } finally {
      setIsRetrying(false);
    }
  }, [clearTrail, loadTrailData]);

  // Carregamento inicial
  if (progressLoading) {
    return (
      <OnboardingLayout currentStep={1} title="Carregando...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      currentStep={1} 
      title="Personalização e Trilha VIVER DE IA"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage 
          userName={firstName}
          message={!isOnboardingCompleted 
            ? "Eu sou o Milagrinho, seu assistente de IA do VIVER DE IA Club. Vamos começar conhecendo um pouco sobre você. Estas informações vão me ajudar a personalizar sua experiência, onde você vai encontrar uma comunidade incrível transformando negócios com IA."
            : "Parabéns! Você concluiu o onboarding. Aqui você pode editar suas informações e consultar ou gerar uma nova trilha personalizada sempre que quiser!"
          }
        />

        {/* Fluxo: onboarding incompleto, mostra formulário. Caso completo, mostra área de controle + trilha diretamente */}
        {!isOnboardingCompleted ? (
          <div className="mt-8">
            <PersonalInfoFormFull />
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 border border-[#0ABAB5]/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-[#0ABAB5] mb-1">
                  Onboarding Completo!
                </h3>
                <p className="text-gray-600 text-sm">
                  Edite suas respostas sempre que precisar. Você pode acessar sua trilha já gerada ou gerar uma nova a qualquer momento!
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate("/onboarding/review")}>
                  Revisar/Editar Respostas
                </Button>
                
                {/* Exibe botões com base na existência da trilha */}
                {trailLoading || isRetrying ? (
                  <Button disabled className="bg-gray-200 text-gray-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando trilha...
                  </Button>
                ) : hasContent ? (
                  <Button 
                    className="bg-[#0ABAB5] text-white hover:bg-[#09a19c]" 
                    onClick={() => setShowTrailPanel((prev) => !prev)}
                  >
                    {!showTrailPanel ? "Ver Minha Trilha" : "Ocultar Trilha"}
                  </Button>
                ) : (
                  <Button
                    className="bg-[#0ABAB5] text-white hover:bg-[#09a19c]"
                    onClick={handleGenerateTrail}
                  >
                    Gerar Trilha Personalizada
                  </Button>
                )}
                
                {hasContent && (
                  <Button
                    variant="secondary"
                    className="border-[#0ABAB5] text-[#0ABAB5]"
                    onClick={handleGenerateTrail}
                  >
                    Gerar Nova Trilha
                  </Button>
                )}
                
                {(loadingError || loadTimeout) && (
                  <Button
                    variant="outline"
                    onClick={handleForceRefresh}
                    className="flex items-center gap-1 border-amber-500 text-amber-600"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Recarregar
                  </Button>
                )}
              </div>
            </div>
            
            {/* Exibe painel da trilha já carregada logo abaixo do header quando a trilha existe e não está carregando */}
            {showTrailPanel && hasContent && !trailLoading && !isRetrying && (
              <div className="mt-8">
                <TrailGenerationPanel onClose={() => setShowTrailPanel(false)} />
              </div>
            )}
            
            {/* Em loading */}
            {(showTrailPanel && (trailLoading || isRetrying)) && (
              <div className="flex flex-col items-center gap-4 py-8 mt-8">
                <div className="w-12 h-12 border-4 border-t-[#0ABAB5] border-r-[#0ABAB5]/30 border-b-[#0ABAB5]/10 border-l-[#0ABAB5]/30 rounded-full animate-spin"></div>
                <span className="text-[#0ABAB5] font-medium">Carregando sua trilha personalizada...</span>
                {attemptCount > 2 && (
                  <button 
                    onClick={handleForceRefresh}
                    className="mt-2 text-sm text-gray-500 hover:text-[#0ABAB5] underline"
                  >
                    Este processo está demorando. Clique para tentar novamente.
                  </button>
                )}
              </div>
            )}
            
            {/* Caso não haja trilha após abertura do painel ou erro */}
            {showTrailPanel && (!hasContent || loadingError || loadTimeout) && !trailLoading && !isRetrying && (
              <div className="mt-8 p-6 bg-amber-50 rounded-lg border border-amber-200 flex flex-col items-center">
                <AlertCircle className="text-amber-500 h-10 w-10 mb-3" />
                <p className="text-gray-700 mb-4 text-center max-w-lg">
                  {loadingError 
                    ? "Ocorreu um erro ao carregar sua trilha. Por favor, tente novamente."
                    : loadTimeout
                      ? "O carregamento da trilha excedeu o tempo limite. Por favor, tente novamente."
                      : "Nenhuma trilha personalizada foi encontrada. Vamos criar uma agora para você começar!"}
                </p>
                <div className="flex justify-center gap-2">
                  <Button 
                    className="bg-[#0ABAB5] text-white" 
                    onClick={handleGenerateTrail}
                  >
                    Gerar Trilha Personalizada
                  </Button>
                  
                  {(loadingError || loadTimeout) && (
                    <Button
                      variant="outline"
                      onClick={handleForceRefresh}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Tentar Novamente
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default Onboarding;
