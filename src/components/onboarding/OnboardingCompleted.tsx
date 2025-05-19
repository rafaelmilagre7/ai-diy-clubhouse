
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Edit, Map, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { OnboardingProgress } from "@/types/onboarding";
import { toast } from "sonner";
import { ReviewStep } from "@/components/onboarding/steps/ReviewStep";

export const OnboardingCompleted = () => {
  const navigate = useNavigate();
  const { progress, isLoading, refreshProgress } = useProgress();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);
  
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

  // Função para navegar para uma etapa específica para edição
  const handleNavigateToStep = (stepId: string) => {
    console.log("[OnboardingCompleted] Navegando para editar etapa:", stepId);
    navigate(`/onboarding/${stepId}`);
  };

  if (isInitialLoad) {
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
            onClick={() => navigate("/onboarding")}
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
            onComplete={() => navigate("/implementation-trail")}
            isSubmitting={false}
            navigateToStep={handleNavigateToStep}
          />
        )}
      </div>
      
      <div className="flex flex-col md:flex-row justify-center gap-4 pt-4 mt-8">
        <Button
          onClick={() => navigate("/implementation-trail")}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-black font-medium flex items-center gap-2"
        >
          <Map className="h-4 w-4" />
          Acessar Minha Trilha de Implementação
        </Button>
      </div>
    </div>
  );
};
