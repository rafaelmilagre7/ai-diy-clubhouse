
import React, { useEffect, useState, useRef } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ExperiencePersonalizationStep } from "@/components/onboarding/steps/ExperiencePersonalizationStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ExperiencePersonalization = () => {
  const { saveStepData, progress, completeOnboarding } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading, refreshProgress } = useProgress();
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const navigate = useNavigate();
  const isMounted = useRef(true);
  const isNavigating = useRef(false);
  
  // Efeito para controlar o ciclo de vida do componente
  useEffect(() => {
    isMounted.current = true;
    isNavigating.current = false;
    
    console.log("[ExperiencePersonalization] Componente montado");
    
    return () => {
      console.log("[ExperiencePersonalization] Componente desmontado");
      isMounted.current = false;
    };
  }, []);

  // Efeito para carregar dados ao entrar na página
  useEffect(() => {
    if (!refreshAttempted && isMounted.current) {
      console.log("[ExperiencePersonalization] Carregando dados mais recentes...");
      refreshProgress()
        .then((refreshedData) => {
          if (isMounted.current) {
            console.log("[ExperiencePersonalization] Dados atualizados:", refreshedData || progress);
            setRefreshAttempted(true);
          }
        })
        .catch(error => {
          if (isMounted.current) {
            console.error("[ExperiencePersonalization] Erro ao carregar dados:", error);
            toast.error("Erro ao carregar dados. Algumas informações podem estar desatualizadas.");
            setRefreshAttempted(true);
          }
        });
    }
  }, [refreshAttempted, refreshProgress, progress]); 

  // Função para salvar dados do formulário com retry e navegação melhorada
  const handleSaveData = async (stepId: string, data: any) => {
    if (!isMounted.current || isNavigating.current) return;
    
    setIsSubmitting(true);
    isNavigating.current = true;
    
    try {
      console.log("[ExperiencePersonalization] Salvando dados:", data);
      
      // Verificar dados válidos
      if (!data || !data.experience_personalization) {
        throw new Error("Dados de personalização ausentes ou inválidos");
      }
      
      try {
        // Salvar dados no formato esperado pelo builder
        await saveStepData(stepId, data, false);
        console.log("[ExperiencePersonalization] Dados salvos com sucesso");
        
        if (isMounted.current) {
          toast.success("Suas preferências foram salvas com sucesso!");
          
          // Forçar atualização dos dados locais após salvar
          await refreshProgress();
          
          // Navegar para a próxima etapa com um pequeno delay para garantir animações
          setTimeout(() => {
            if (isMounted.current) {
              console.log("[ExperiencePersonalization] Navegando para a próxima etapa");
              navigate("/onboarding/complementary");
            }
          }, 500);
        }
      } catch (error) {
        // Mesmo com erro no salvamento, tentar prosseguir se os dados estiverem minimamente preenchidos
        console.error("[ExperiencePersonalization] Erro ao salvar, mas tentando navegar:", error);
        
        if (isMounted.current) {
          toast.error("Erro ao salvar alguns dados. Tentando prosseguir mesmo assim.");
          
          // Navegar mesmo com erro para evitar usuário travado
          setTimeout(() => {
            if (isMounted.current) {
              console.log("[ExperiencePersonalization] Navegando para próxima etapa mesmo com erro");
              navigate("/onboarding/complementary");
            }
          }, 1000);
        }
      }
    } catch (error) {
      if (isMounted.current) {
        console.error("[ExperiencePersonalization] Erro crítico:", error);
        toast.error("Erro ao processar dados. Por favor, tente novamente.");
        isNavigating.current = false;
      }
    } finally {
      if (isMounted.current) {
        setTimeout(() => {
          setIsSubmitting(false);
        }, 500);
      }
    }
  };

  // Função para tentar recarregar dados
  const handleRetry = () => {
    setRefreshAttempted(false);
  };
  
  // Função segura para voltar à etapa anterior
  const handleNavigateBack = () => {
    if (isNavigating.current) return;
    
    isNavigating.current = true;
    console.log("[ExperiencePersonalization] Navegando para a etapa anterior");
    navigate("/onboarding/club-goals");
  };

  return (
    <OnboardingLayout
      currentStep={6}
      title="Personalização da Experiência"
      backUrl="/onboarding/club-goals"
      onBackClick={handleNavigateBack}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Vamos personalizar sua experiência no VIVER DE IA Club. Suas preferências nos ajudarão a entregar conteúdo e oportunidades que sejam mais relevantes para você."
        />
        
        {isLoading && !refreshAttempted ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0ABAB5]"></div>
          </div>
        ) : !progress ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-medium text-red-800">Erro ao carregar dados</h3>
            <p className="text-sm text-red-600 mt-2">
              Não foi possível carregar suas informações. Por favor, tente novamente.
            </p>
            <button 
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <ExperiencePersonalizationStep
            onSubmit={handleSaveData}
            isSubmitting={isSubmitting}
            initialData={progress}
            isLastStep={false}
            onComplete={completeOnboarding}
            onPrevious={handleNavigateBack}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default ExperiencePersonalization;
