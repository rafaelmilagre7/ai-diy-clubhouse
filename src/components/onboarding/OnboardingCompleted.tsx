
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Edit, Map, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { toast } from "sonner";
import { ReviewStep } from "@/components/onboarding/steps/ReviewStep";

export const OnboardingCompleted = () => {
  const navigate = useNavigate();
  const { progress, isLoading: progressLoading, refreshProgress } = useProgress();
  const { generateImplementationTrail, regenerating, hasContent: trailExists } = useImplementationTrail();
  
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);
  const [isGeneratingTrail, setIsGeneratingTrail] = useState(false);
  const [trailGenerated, setTrailGenerated] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Efeito para carregar dados atualizados
  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshProgress();
      } catch (error) {
        console.error("[OnboardingCompleted] Erro ao carregar progresso:", error);
        toast.error("Erro ao carregar seus dados. Tente recarregar a página.");
      } finally {
        setIsInitialLoad(false);
      }
    };
    
    loadData();
  }, [refreshProgress]);
  
  // Efeito para disparar confetti quando completado com sucesso
  useEffect(() => {
    if (!isInitialLoad && progress?.is_completed && !hasShownConfetti) {
      // Disparar efeito de confete quando os dados estiverem carregados
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0ABAB5', '#6de2de', '#9EECEA']
      });
      
      setHasShownConfetti(true);
    }
  }, [isInitialLoad, progress, hasShownConfetti]);

  // Efeito para verificar se a trilha já existe e definir estado
  useEffect(() => {
    if (trailExists) {
      setTrailGenerated(true);
    }
  }, [trailExists]);

  // Função para navegar para uma etapa específica para edição
  const handleNavigateToStep = useCallback((stepId: string) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    console.log("[OnboardingCompleted] Navegando para editar etapa:", stepId);
    navigate(`/onboarding/${stepId}`);
  }, [navigate, isNavigating]);

  // Função para gerar a trilha de implementação
  const handleGenerateTrail = useCallback(async () => {
    if (!progress || isGeneratingTrail || trailGenerated || isNavigating || regenerating) {
      return;
    }

    try {
      setIsGeneratingTrail(true);
      toast.info("Iniciando geração da sua trilha personalizada...");
      
      // Forçar regeneração da trilha (true como segundo parâmetro indica regeneração)
      const generatedTrail = await generateImplementationTrail(progress, true);
      
      if (generatedTrail) {
        toast.success("Trilha de implementação gerada com sucesso!");
        setTrailGenerated(true);
        
        // Pequeno delay para garantir que o usuário veja a mensagem de sucesso
        setTimeout(() => {
          if (!isNavigating) {
            setIsNavigating(true);
            navigate("/implementation-trail");
          }
        }, 800);
      } else {
        toast.error("Não foi possível gerar sua trilha. Tentando novamente em 3 segundos...");
        
        // Tentar novamente após 3 segundos (apenas uma vez)
        setTimeout(async () => {
          toast.info("Tentando gerar trilha novamente...");
          const retryTrail = await generateImplementationTrail(progress, true);
          
          if (retryTrail) {
            toast.success("Trilha de implementação gerada com sucesso na segunda tentativa!");
            setTrailGenerated(true);
            
            setTimeout(() => {
              if (!isNavigating) {
                setIsNavigating(true);
                navigate("/implementation-trail");
              }
            }, 800);
          } else {
            toast.error("Não foi possível gerar sua trilha. Por favor, tente novamente mais tarde.");
          }
          
          setIsGeneratingTrail(false);
        }, 3000);
        return;
      }
    } catch (error) {
      console.error("[OnboardingCompleted] Erro ao gerar trilha:", error);
      toast.error("Ocorreu um erro ao gerar sua trilha personalizada. Por favor, tente novamente mais tarde.");
    } finally {
      setIsGeneratingTrail(false);
    }
  }, [progress, isGeneratingTrail, trailGenerated, isNavigating, regenerating, generateImplementationTrail, navigate]);

  // Navegar para a trilha se já foi gerada
  const handleViewTrail = useCallback(() => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    navigate("/implementation-trail");
  }, [navigate, isNavigating]);

  if (isInitialLoad || progressLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-[#151823] border border-neutral-700/50 rounded-lg shadow-lg p-8 text-center">
        <Loader2 className="animate-spin h-10 w-10 text-[#0ABAB5] mx-auto" />
        <p className="mt-4 text-neutral-300">Carregando seus dados...</p>
      </div>
    );
  }

  if (!progress?.is_completed) {
    return (
      <div className="max-w-4xl mx-auto bg-[#151823] border border-neutral-700/50 rounded-lg shadow-lg p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-600/20 flex items-center justify-center mx-auto">
          <Edit className="h-10 w-10 text-amber-500" />
        </div>
        
        <h3 className="text-2xl font-bold text-white">Onboarding Incompleto</h3>
        
        <p className="text-neutral-200 max-w-md mx-auto">
          Parece que você ainda não completou todas as etapas do onboarding. Complete todas as etapas para personalizar sua experiência.
        </p>
        
        <div className="pt-4">
          <Button
            onClick={() => {
              if (!isNavigating) {
                setIsNavigating(true);
                navigate("/onboarding");
              }
            }}
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-black font-medium"
          >
            Continuar Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-[#151823] border border-neutral-700/50 rounded-lg shadow-lg p-8 space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-[#0ABAB5]/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10 text-[#0ABAB5]" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mt-4">Onboarding Concluído com Sucesso!</h3>
        
        <p className="text-neutral-200 max-w-md mx-auto mt-2">
          Obrigado por compartilhar suas informações. Aqui está um resumo dos seus dados. Você pode editar qualquer seção se necessário.
        </p>
      </div>
      
      <div className="bg-gradient-to-br from-[#1A1E2E] to-[#151823] rounded-lg p-6 border border-neutral-700/50 shadow-md">
        {progress && (
          <ReviewStep 
            progress={progress}
            onComplete={handleGenerateTrail}
            isSubmitting={isGeneratingTrail || regenerating}
            navigateToStep={handleNavigateToStep}
          />
        )}
      </div>
      
      <div className="flex flex-col md:flex-row justify-center gap-4 pt-4 mt-8">
        <Button
          onClick={handleGenerateTrail}
          disabled={isGeneratingTrail || regenerating || trailGenerated || isNavigating}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-black font-medium flex items-center gap-2"
        >
          {isGeneratingTrail || regenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando sua trilha personalizada...
            </>
          ) : trailGenerated ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Trilha Gerada com Sucesso
            </>
          ) : (
            <>
              <Map className="h-4 w-4" />
              Concluir e Gerar Minha Trilha
            </>
          )}
        </Button>
        
        {trailGenerated && (
          <Button
            onClick={handleViewTrail}
            disabled={isNavigating}
            variant="outline"
            className="border-[#0ABAB5]/30 text-[#0ABAB5] hover:bg-[#0ABAB5]/10"
          >
            Ver Minha Trilha
          </Button>
        )}
      </div>
    </div>
  );
};
