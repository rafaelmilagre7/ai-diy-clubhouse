
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PersonalInfoStep } from "@/components/onboarding/steps/PersonalInfoStep";
import { useNavigate } from "react-router-dom";
import { usePersonalInfoStep } from "@/hooks/onboarding/usePersonalInfoStep";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const [loadingAttempts, setLoadingAttempts] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [forceSkipLoading, setForceSkipLoading] = useState(false);
  
  // Usar hook useProgress para obter e manter dados de progresso
  const { progress, isLoading, refreshProgress, lastError } = useProgress();
  
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
      setLoadError(null);
      console.log("[DEBUG] Tentativa #" + (loadingAttempts + 1) + " de carregar dados");
      
      await refreshProgress();
      console.log("[DEBUG] Dados de progresso atualizados:", progress);
      
      if (progress) {
        loadInitialData();
      }
      setLoadingAttempts(prev => prev + 1);
    } catch (error) {
      console.error("[ERRO] Falha ao carregar dados:", error);
      setLoadError("Erro ao carregar dados. Por favor, tente novamente.");
    }
  };

  useEffect(() => {
    console.log("[DEBUG] PersonalInfo montado - iniciando carregamento de dados");
    attemptDataLoad();
    
    // Definir timeout de segurança
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn("[DEBUG] Timeout de segurança acionado para evitar loading infinito");
        setForceSkipLoading(true);
      }
    }, 8000); // 8 segundos de timeout absoluto
    
    return () => {
      console.log("[DEBUG] PersonalInfo desmontado");
      clearTimeout(safetyTimeout);
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

  // Forçar continuação se o carregamento estiver demorando muito
  if ((loadingAttempts >= 3 || forceSkipLoading) && isLoading) {
    return (
      <OnboardingLayout 
        currentStep={1} 
        title="Dados Pessoais" 
        backUrl="/"
      >
        <div className="space-y-6">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="ml-2 text-yellow-700">
              Estamos tendo dificuldades para carregar seus dados. Você pode continuar mesmo assim ou tentar novamente.
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center mt-6 space-x-4">
            <button 
              onClick={() => {
                // Forçar carregamento com dados padrão vazios
                toast.info("Continuando com dados padrão");
                setForceSkipLoading(true);
                setLoadingAttempts(0);
              }}
              className="px-4 py-2 bg-[#0ABAB5] text-white rounded hover:bg-[#0ABAB5]/90"
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

  // Se ainda está carregando (e não atingimos o limite de tentativas)
  if (isLoading && !forceSkipLoading) {
    console.log("[DEBUG] Exibindo spinner de carregamento");
    return (
      <OnboardingLayout 
        currentStep={1} 
        title="Dados Pessoais" 
        backUrl="/"
      >
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
          <p className="ml-4 text-gray-400">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }

  // Se houver erro, mostramos uma mensagem de erro com opção para tentar novamente
  if (loadError || lastError) {
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
              {loadError || (lastError ? "Erro ao carregar dados de progresso." : "")}
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center mt-6 space-x-4">
            <button 
              onClick={attemptDataLoad}
              className="px-4 py-2 bg-[#0ABAB5] text-white rounded hover:bg-[#0ABAB5]/90"
            >
              Tentar Novamente
            </button>
            <button 
              onClick={() => {
                // Continuar com dados padrão
                setForceSkipLoading(true);
                toast.info("Continuando com dados padrão");
              }}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Continuar Mesmo Assim
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
