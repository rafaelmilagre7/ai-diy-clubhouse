
import React, { useState, useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import { AIExperienceStep } from "@/components/onboarding/steps/AIExperienceStep";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useStepPersistenceCore } from "@/hooks/onboarding/useStepPersistenceCore";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";

const FormacaoAIExperience = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { progress, isLoading, refreshProgress } = useProgress();
  
  const { saveStepData } = useStepPersistenceCore({
    currentStepIndex: 1,
    setCurrentStepIndex: () => {}, // Não usado neste componente
    navigate,
    onboardingType: 'formacao',
  });
  
  useEffect(() => {
    console.log("[Formação AIExperience] Carregando dados iniciais");
    const loadInitialData = async () => {
      try {
        await refreshProgress();
        console.log("[Formação AIExperience] Dados carregados:", progress);
      } catch (error) {
        console.error("[Formação AIExperience] Erro ao carregar dados:", error);
      }
    };
    
    loadInitialData();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      console.log("[Formação AIExperience] Submetendo dados:", data);
      
      await saveStepData("ai_exp", {
        ai_experience: data,
        onboarding_type: 'formacao'
      });
      
      navigate("/onboarding/formacao/goals");
      
    } catch (error) {
      console.error("[Formação AIExperience] Erro ao salvar:", error);
      toast.error("Erro ao salvar seus dados. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <OnboardingLayout 
        currentStep={2} 
        title="Experiência com IA" 
        backUrl="/onboarding/formacao/personal-info"
        isFormacao={true}
      >
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
          <p className="ml-4 text-gray-400">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      currentStep={2} 
      title="Experiência com IA" 
      backUrl="/onboarding/formacao/personal-info"
      isFormacao={true}
    >
      <div className="text-gray-300 mb-6">
        <p>Conte-nos sobre sua experiência atual com Inteligência Artificial.</p>
        <p>Essas informações nos ajudarão a personalizar seu aprendizado.</p>
      </div>
      
      <AIExperienceStep
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        initialData={progress?.ai_experience}
        personalInfo={progress?.personal_info}
      />
    </OnboardingLayout>
  );
};

export default FormacaoAIExperience;
