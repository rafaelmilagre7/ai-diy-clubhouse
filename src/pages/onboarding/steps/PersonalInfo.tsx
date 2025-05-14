
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PersonalInfoStep } from "@/components/onboarding/steps/PersonalInfoStep";
import { useNavigate } from "react-router-dom";
import { usePersonalInfoStep } from "@/hooks/onboarding/usePersonalInfoStep";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CloudOff, RefreshCw } from "lucide-react";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const [loadingAttempts, setLoadingAttempts] = useState(0);
  
  // Usar hook useProgress para obter e manter dados de progresso
  const { 
    progress, 
    isLoading, 
    refreshProgress, 
    lastError, 
    isOfflineMode,
    initializeOfflineMode 
  } = useProgress();
  
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    isSaving,
    lastSaveTime,
    loadInitialData
  } = usePersonalInfoStep();

  // Função para tentar carregar dados novamente
  const attemptDataLoad = async () => {
    try {
      console.log("[DEBUG] Tentativa #" + (loadingAttempts + 1) + " de carregar dados");
      
      await refreshProgress();
      console.log("[DEBUG] Dados de progresso atualizados:", progress);
      
      if (progress) {
        loadInitialData();
      }
      setLoadingAttempts(prev => prev + 1);
    } catch (error) {
      console.error("[ERRO] Falha ao carregar dados:", error);
      
      // Se falhar após múltiplas tentativas, ativar modo offline
      if (loadingAttempts >= 1) {
        console.log("[DEBUG] Ativando modo offline após falhas de carregamento");
        initializeOfflineMode();
      }
    }
  };

  useEffect(() => {
    console.log("[DEBUG] PersonalInfo montado - iniciando carregamento de dados");
    attemptDataLoad();
    
    return () => {
      console.log("[DEBUG] PersonalInfo desmontado");
    };
  }, []);

  // Carregar dados iniciais quando o progresso estiver disponível
  useEffect(() => {
    if (progress && !isSubmitting) {
      loadInitialData();
    }
  }, [progress, loadInitialData, isSubmitting]);

  // Adaptador simplificado para compatibilidade com a nova assinatura de onSubmit
  const handleSuccess = async (stepId?: string, data?: any) => {
    console.log("[DEBUG] Tentativa de envio do formulário", { stepId, data });
    
    // Se dados foram passados, usá-los; caso contrário, usar formData
    const dataToSubmit = data || formData;
    
    // Verificar campos obrigatórios antes de tentar salvar
    if (!dataToSubmit.state) {
      toast.error("Por favor, preencha o estado");
      return;
    }
    
    if (!dataToSubmit.city) {
      toast.error("Por favor, preencha a cidade");
      return;
    }
    
    // Garantir que temos um timezone selecionado
    if (!dataToSubmit.timezone) {
      dataToSubmit.timezone = "America/Sao_Paulo";
    }
    
    const success = await handleSubmit();
    if (success) {
      console.log("[DEBUG] Formulário enviado com sucesso, navegando para próxima etapa");
      navigate("/onboarding/professional-data");
    } else {
      console.log("[DEBUG] Falha ao enviar formulário");
    }
  };

  // Se ainda está carregando
  if (isLoading) {
    return (
      <OnboardingLayout 
        currentStep={1} 
        title="Dados Pessoais" 
        backUrl="/"
      >
        <div className="flex flex-col justify-center items-center py-20 space-y-6">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }

  // Se estamos em modo offline
  if (isOfflineMode) {
    return (
      <OnboardingLayout 
        currentStep={1} 
        title="Dados Pessoais" 
        backUrl="/"
      >
        <Alert className="bg-blue-50 border-blue-200 mb-6">
          <CloudOff className="h-5 w-5 text-blue-600" />
          <AlertDescription className="ml-2 text-blue-700">
            Você está no modo offline. Os dados serão armazenados localmente.
          </AlertDescription>
        </Alert>
        
        <PersonalInfoStep
          onSubmit={handleSuccess}
          isSubmitting={isSubmitting}
          formData={formData}
          errors={errors}
          onChange={handleChange}
          isSaving={isSaving}
          lastSaveTime={lastSaveTime}
        />
      </OnboardingLayout>
    );
  }

  // Se houver erro, mostramos uma mensagem de erro com opção para tentar novamente
  if (lastError) {
    return (
      <OnboardingLayout 
        currentStep={1} 
        title="Dados Pessoais" 
        backUrl="/"
      >
        <div className="space-y-6">
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              {lastError ? "Não foi possível carregar seus dados. Verifique sua conexão e tente novamente." : ""}
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center mt-6 space-x-4">
            <button 
              onClick={attemptDataLoad}
              className="flex items-center px-4 py-2 bg-[#0ABAB5] text-white rounded hover:bg-[#0ABAB5]/90"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </button>
            <button 
              onClick={() => {
                // Ativar modo offline
                initializeOfflineMode();
                toast.info("Modo offline ativado. Suas alterações serão salvas localmente.");
              }}
              className="flex items-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              <CloudOff className="h-4 w-4 mr-2" />
              Continuar Offline
            </button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      currentStep={1} 
      title="Dados Pessoais" 
      backUrl="/"
    >
      <PersonalInfoStep
        onSubmit={handleSuccess}
        isSubmitting={isSubmitting}
        formData={formData}
        errors={errors}
        onChange={handleChange}
        isSaving={isSaving}
        lastSaveTime={lastSaveTime}
      />
    </OnboardingLayout>
  );
};

export default PersonalInfo;
