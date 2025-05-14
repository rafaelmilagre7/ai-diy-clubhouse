
import React, { useState, useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import { PersonalInfoStep } from "@/components/onboarding/steps/PersonalInfoStep";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useStepPersistenceCore } from "@/hooks/onboarding/useStepPersistenceCore";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle } from "lucide-react";

const FormacaoPersonalInfo = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingAttempts, setLoadingAttempts] = useState(0);
  const [forceSkipLoading, setForceSkipLoading] = useState(false);
  const { progress, isLoading, refreshProgress, lastError } = useProgress();
  
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState<any>({
    timezone: "America/Sao_Paulo" // Garantir que o timezone seja definido por padrão
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { saveStepData } = useStepPersistenceCore({
    currentStepIndex: 0,
    setCurrentStepIndex: () => {}, // Não usado neste componente
    navigate,
    onboardingType: 'formacao', // Especificando o tipo de onboarding
  });
  
  // Estado para controlar quando mostrar erros
  const [showError, setShowError] = useState(false);
  
  // Função para tentar carregar dados novamente
  const attemptDataLoad = async () => {
    try {
      console.log("[Formação PersonalInfo] Tentativa #" + (loadingAttempts + 1) + " de carregar dados");
      await refreshProgress();
      
      // Se temos dados de progresso, inicializar o formulário
      if (progress?.personal_info) {
        setFormData({
          ...progress.personal_info,
          // Garantir que o timezone está definido
          timezone: progress.personal_info.timezone || "America/Sao_Paulo"
        });
      } else {
        // Definir valor padrão do timezone se não houver dados
        setFormData(prev => ({
          ...prev,
          timezone: "America/Sao_Paulo"
        }));
      }
      
      setLoadingAttempts(prev => prev + 1);
    } catch (error) {
      console.error("[Formação PersonalInfo] Erro ao carregar dados:", error);
      setShowError(true);
    }
  };
  
  useEffect(() => {
    console.log("[Formação PersonalInfo] Carregando dados iniciais");
    attemptDataLoad();
    
    // Safety timeout para evitar loading infinito
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn("[DEBUG] Timeout de segurança acionado para evitar loading infinito");
        setForceSkipLoading(true);
      }
    }, 8000); // 8 segundos de timeout absoluto
    
    return () => {
      clearTimeout(safetyTimeout);
    };
  }, []);
  
  // Mostrar erro após 3 segundos se ainda estiver carregando
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && !forceSkipLoading) {
        setShowError(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading, forceSkipLoading]);

  // Função para processar alterações de campo
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo se existir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Função para processar o envio do formulário
  const handleSubmit = async (stepId?: string, data?: any) => {
    try {
      setIsSubmitting(true);
      console.log("[Formação PersonalInfo] Submetendo dados:", data || formData);
      
      // Verificar campos obrigatórios
      const dataToSave = data || formData;
      const newErrors: Record<string, string> = {};
      
      if (!dataToSave.state) {
        newErrors.state = "Estado é obrigatório";
      }
      
      if (!dataToSave.city) {
        newErrors.city = "Cidade é obrigatória";
      }
      
      // Garantir que timezone está definido
      if (!dataToSave.timezone) {
        dataToSave.timezone = "America/Sao_Paulo";
      }
      
      // Se há erros, mostrar e não prosseguir
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        const errorFields = Object.keys(newErrors).join(', ');
        toast.error(`Por favor preencha os campos: ${errorFields}`);
        return;
      }
      
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

  // Forçar continuação se o carregamento estiver demorando muito
  if ((loadingAttempts >= 3 || forceSkipLoading) && isLoading) {
    return (
      <OnboardingLayout 
        currentStep={1} 
        title="Dados Pessoais" 
        backUrl="/onboarding/formacao"
        isFormacao={true}
      >
        <div className="space-y-6">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="ml-2 text-yellow-700">
              Estamos tendo dificuldades para carregar seus dados. Você pode continuar mesmo assim ou tentar novamente.
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center mt-6 space-x-4">
            <button 
              onClick={() => {
                setForceSkipLoading(true);
                setShowError(false);
                toast.info("Continuando com dados padrão");
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Continuar Mesmo Assim
            </button>
            <button 
              onClick={attemptDataLoad}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  if (isLoading && !showError && !forceSkipLoading) {
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

  if ((showError && (isLoading || lastError)) || loadingAttempts >= 3) {
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
            Estamos com dificuldades para carregar seus dados. Você pode tentar novamente ou continuar com dados básicos.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center space-x-4 mt-6">
          <button 
            onClick={() => {
              setForceSkipLoading(true);
              setShowError(false);
              toast.info("Continuando com dados básicos");
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Continuar Mesmo Assim
          </button>
          <button 
            onClick={() => {
              setShowError(false);
              attemptDataLoad();
            }}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Tentar Novamente
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
        errors={errors}
        onChange={handleFieldChange}
      />
    </OnboardingLayout>
  );
};

export default FormacaoPersonalInfo;
