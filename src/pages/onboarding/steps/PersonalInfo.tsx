
import React, { useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PersonalInfoStep } from "@/components/onboarding/steps/PersonalInfoStep";
import { useNavigate } from "react-router-dom";
import { usePersonalInfoStep } from "@/hooks/onboarding/usePersonalInfoStep";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const { isLoading: progressLoading, refreshProgress, resetProgress } = useProgress();
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

  // Debug logs de montagem
  useEffect(() => {
    console.log("[DEBUG] PersonalInfo montado - iniciando carregamento de dados");
    const fetchData = async () => {
      console.log("[DEBUG] Atualizando progresso para pegar dados mais recentes");
      await refreshProgress();
      console.log("[DEBUG] Carregando dados iniciais do formulário após refresh");
      loadInitialData();
    };
    
    fetchData();
    
    // Log do ciclo de vida
    return () => {
      console.log("[DEBUG] PersonalInfo desmontado");
    };
  }, [refreshProgress, loadInitialData]);

  // Log de alterações nos dados do formulário
  useEffect(() => {
    console.log("[DEBUG] Dados do formulário atualizados:", formData);
  }, [formData]);

  const handleSuccess = async () => {
    console.log("[DEBUG] Tentativa de envio do formulário");
    const success = await handleSubmit();
    if (success) {
      console.log("[DEBUG] Formulário enviado com sucesso, navegando para próxima etapa");
      navigate("/onboarding/professional-data");
    } else {
      console.log("[DEBUG] Falha ao enviar formulário");
    }
  };

  // Função para limpar dados (apenas para debug)
  const handleResetData = async () => {
    console.log("[DEBUG] Solicitação de reset de dados");
    if (confirm("Tem certeza que deseja limpar todos os dados de progresso? Esta ação não pode ser desfeita.")) {
      const success = await resetProgress();
      if (success) {
        window.location.reload();
      }
    }
  };

  if (progressLoading) {
    console.log("[DEBUG] Exibindo spinner de carregamento");
    return (
      <OnboardingLayout 
        currentStep={1} 
        title="Dados Pessoais" 
        backUrl="/"
      >
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size={10} />
          <p className="ml-4 text-gray-400">Carregando seus dados...</p>
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
      {/* Apenas em ambiente de desenvolvimento */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-6 p-3 bg-yellow-100 border border-yellow-400 rounded-md">
          <h3 className="font-semibold text-yellow-800">Modo de Depuração</h3>
          <p className="text-sm text-yellow-700 mb-2">Use estas ferramentas para diagnosticar problemas de persistência de dados.</p>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                refreshProgress();
                toast.info("Dados recarregados do banco");
                loadInitialData();
              }}
            >
              Recarregar Dados
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleResetData}
            >
              Resetar Progresso
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                console.log("Estado atual do formulário:", formData);
                console.log("Erros:", errors);
                toast.info("Dados logados no console");
              }}
            >
              Log Estado
            </Button>
          </div>
        </div>
      )}
      
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
