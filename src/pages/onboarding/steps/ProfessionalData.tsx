
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ProfessionalDataStep } from "@/components/onboarding/steps/ProfessionalDataStep";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

const ProfessionalData = () => {
  const {
    currentStepIndex,
    steps,
    isSubmitting,
    saveStepData,
    progress,
    refreshProgress
  } = useOnboardingSteps();
  
  const [isLocalLoading, setIsLocalLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar se estamos na rota correta
  useEffect(() => {
    // Garantir que esta página só seja acessada pela rota correta
    if (location.pathname !== "/onboarding/professional-data") {
      console.warn(`Rota incorreta detectada: ${location.pathname}, deveria ser /onboarding/professional-data`);
    }
  }, [location.pathname]);

  // Buscar dados atualizados ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("ProfessionalData - Carregando dados profissionais");
        setIsLocalLoading(true);
        await refreshProgress();
      } catch (error) {
        console.error("Erro ao carregar dados profissionais:", error);
        toast.error("Erro ao carregar seus dados. Por favor, recarregue a página.");
      } finally {
        setIsLocalLoading(false);
      }
    };
    
    loadData();
  }, [refreshProgress]);

  // Função para calcular o progresso
  const progressPercentage = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  // Função para salvar dados e garantir navegação
  const handleSaveData = async (data: any) => {
    try {
      console.log("ProfessionalData - Salvando dados:", data);
      
      // Usar saveStepData do hook
      await saveStepData(data);
      
      // Verificar se a navegação automática funcionou e forçar redirecionamento se necessário
      setTimeout(() => {
        console.log("Verificando navegação para a próxima etapa...");
        const currentPath = window.location.pathname;
        
        if (currentPath === "/onboarding/professional-data") {
          console.log("Navegação não ocorreu automaticamente, forçando redirecionamento para a próxima etapa");
          navigate("/onboarding/business-context");
        }
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao salvar dados profissionais:", error);
      toast.error("Ocorreu um erro ao salvar seus dados. Por favor, tente novamente.");
    }
  };

  // Renderizar estado de carregamento enquanto buscamos os dados
  if (isLocalLoading) {
    return (
      <OnboardingLayout
        currentStep={currentStepIndex + 1}
        totalSteps={steps.length}
        title="Dados Profissionais"
        backUrl="/onboarding"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0ABAB5]"></div>
          <span className="ml-3 text-gray-600">Carregando seus dados...</span>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      currentStep={currentStepIndex + 1}
      totalSteps={steps.length}
      title="Dados Profissionais"
      backUrl="/onboarding"
      progress={progressPercentage}
    >
      <ProfessionalDataStep
        onSubmit={handleSaveData}
        isSubmitting={isSubmitting}
        isLastStep={false}
        onComplete={() => {}}
        initialData={progress}
        personalInfo={progress?.personal_info}
      />
    </OnboardingLayout>
  );
};

export default ProfessionalData;
