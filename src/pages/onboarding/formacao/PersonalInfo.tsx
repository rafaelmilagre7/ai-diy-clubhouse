
import React, { useState, useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import { PersonalInfoStep } from "@/components/onboarding/steps/PersonalInfoStep";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useStepPersistenceCore } from "@/hooks/onboarding/useStepPersistenceCore";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const FormacaoPersonalInfo = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { progress, isLoading, refreshProgress, lastError } = useProgress();
  
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState<any>({});
  
  const { saveStepData } = useStepPersistenceCore({
    currentStepIndex: 0,
    setCurrentStepIndex: () => {}, // Não usado neste componente
    navigate,
    onboardingType: 'formacao', // Especificando o tipo de onboarding
  });
  
  // Estado para controlar quando mostrar erros
  const [showError, setShowError] = useState(false);
  
  useEffect(() => {
    console.log("[Formação PersonalInfo] Carregando dados iniciais");
    const loadInitialData = async () => {
      try {
        await refreshProgress();
        console.log("[Formação PersonalInfo] Dados carregados:", progress);
      } catch (error) {
        console.error("[Formação PersonalInfo] Erro ao carregar dados:", error);
        setShowError(true);
      }
    };
    
    loadInitialData();
  }, []);
  
  // Mostrar erro após 3 segundos se ainda estiver carregando
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowError(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Função para processar o envio do formulário - adaptar para a nova assinatura
  const handleSubmit = async (stepId?: string, data?: any) => {
    try {
      setIsSubmitting(true);
      console.log("[Formação PersonalInfo] Submetendo dados:", data || formData);
      
      // Usar os dados passados ou cair para o estado formData
      const dataToSave = data || formData;
      
      // Enviando dados para o backend com flag de formação
      await saveStepData("personal", {
        personal_info: dataToSave,
        onboarding_type: 'formacao'
      });
      
      // Navegação para próxima etapa da formação
      navigate("/onboarding/formacao/ai-experience");
      
    } catch (error) {
      console.error("[Formação PersonalInfo] Erro ao salvar:", error);
      toast.error("Erro ao salvar seus dados. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para atualizar o estado formData quando os campos forem alterados
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading && !showError) {
    return (
      <OnboardingLayout 
        currentStep={1} 
        title="Dados Pessoais" 
        backUrl="/onboarding/formacao"
        isFormacao={true}
      >
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
          <p className="ml-4 text-gray-400">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }

  if (showError && (isLoading || lastError)) {
    return (
      <OnboardingLayout 
        currentStep={1} 
        title="Dados Pessoais" 
        backUrl="/onboarding/formacao"
        isFormacao={true}
      >
        <Alert variant="destructive" className="bg-red-50 border-red-200 mt-4">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription>
            Estamos com dificuldades para carregar seus dados. Por favor, tente novamente mais tarde.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Tentar novamente
          </button>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      currentStep={1} 
      title="Dados Pessoais" 
      backUrl="/onboarding/formacao"
      isFormacao={true}
    >
      <div className="text-gray-300 mb-6">
        <p>Para personalizar sua experiência na Formação Viver de IA, precisamos conhecer você melhor.</p>
        <p>Preencha seus dados pessoais para começarmos.</p>
      </div>
      
      <PersonalInfoStep
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        initialData={progress?.personal_info}
        formData={formData}
        errors={{}}
        onChange={handleFormChange}
      />
    </OnboardingLayout>
  );
};

export default FormacaoPersonalInfo;
