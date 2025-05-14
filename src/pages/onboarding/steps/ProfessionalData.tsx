
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ProfessionalDataStep } from "@/components/onboarding/steps/ProfessionalDataStep";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { professionalDataService } from "@/services/onboarding";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const ProfessionalData = () => {
  const navigate = useNavigate();
  const { progress, isLoading, refreshProgress, lastError } = useProgress();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    const loadData = async () => {
      try {
        if (progress && !dataLoaded) {
          console.log("Carregando dados profissionais do progresso:", progress);
          
          // Consolidar dados do progresso
          const data = {
            ...(progress.professional_info || {}),
            company_name: progress.company_name || (progress.professional_info?.company_name || ""),
            company_size: progress.company_size || (progress.professional_info?.company_size || ""),
            company_sector: progress.company_sector || (progress.professional_info?.company_sector || ""),
            company_website: progress.company_website || (progress.professional_info?.company_website || ""),
            current_position: progress.current_position || (progress.professional_info?.current_position || ""),
            annual_revenue: progress.annual_revenue || (progress.professional_info?.annual_revenue || ""),
          };
          
          setInitialData(data);
          console.log("Dados iniciais profissionais carregados:", data);
          setSubmitError(null);
          setDataLoaded(true);
        }
      } catch (error) {
        console.error("Erro ao carregar dados profissionais:", error);
        toast.error("Erro ao carregar seus dados", {
          description: "Por favor, tente novamente."
        });
        setSubmitError("Não foi possível carregar seus dados. Por favor, tente novamente.");
      }
    };
    
    if (!isLoading && progress && !dataLoaded) {
      loadData();
    }
  }, [progress, isLoading, dataLoaded]);
  
  // Função para submeter os dados com tratamento de erros melhorado
  const handleSubmit = async (stepId: string, data: any, shouldNavigate = true): Promise<void> => {
    // Prevenir múltiplas submissões
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      console.log("Submetendo dados profissionais:", data);
      
      if (!progress?.id) {
        throw new Error("ID de progresso não encontrado");
      }
      
      // Verificar estrutura dos dados antes de enviar
      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        throw new Error("Dados inválidos para envio");
      }
      
      // Normalizar dados antes de enviar
      const normalizedData = normalizeData(data);
      
      let success = false;
      let errorMessage = "";
      
      try {
        // Atualizar os dados na tabela de onboarding_progress
        await professionalDataService.save(progress.id, progress.user_id, normalizedData);
        success = true;
      } catch (saveError: any) {
        errorMessage = saveError.message || "Erro ao salvar dados";
        console.error("Erro ao salvar dados:", saveError);
        throw saveError;
      }
      
      if (success) {
        // Recarregar o progresso para refletir as alterações
        await refreshProgress();
        
        // Navegar para a próxima etapa apenas se shouldNavigate for true
        if (shouldNavigate) {
          navigate("/onboarding/business-context");
          
          toast.success("Dados salvos com sucesso", {
            description: "Redirecionando para a próxima etapa..."
          });
        }
      } else {
        throw new Error(errorMessage || "Falha ao salvar dados");
      }
    } catch (error: any) {
      console.error("Erro ao salvar dados profissionais:", error);
      setSubmitError(error.message || "Erro ao salvar dados");
      toast.error("Erro ao salvar dados", {
        description: "Verifique sua conexão e tente novamente"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Função para normalizar os dados
  const normalizeData = (data: any): any => {
    // Se os dados já estiverem no formato esperado, retorná-los
    if (data.professional_info) {
      return {
        professional_info: {
          ...data.professional_info,
          // Garantir que todos os campos obrigatórios estejam presentes
          company_name: data.professional_info.company_name || "",
          company_size: data.professional_info.company_size || "",
          company_sector: data.professional_info.company_sector || "",
          company_website: data.professional_info.company_website || "",
          current_position: data.professional_info.current_position || "",
          annual_revenue: data.professional_info.annual_revenue || ""
        }
      };
    }
    
    // Caso contrário, criar a estrutura correta
    return {
      professional_info: {
        company_name: data.company_name || "",
        company_size: data.company_size || "",
        company_sector: data.company_sector || "",
        company_website: data.company_website || "",
        current_position: data.current_position || "",
        annual_revenue: data.annual_revenue || ""
      }
    };
  };
  
  const handleRetry = () => {
    refreshProgress();
    setSubmitError(null);
    setDataLoaded(false); // Permitir nova tentativa de carregamento
  };
  
  if (isLoading) {
    return (
      <OnboardingLayout 
        currentStep={2} 
        title="Dados Profissionais" 
        backUrl="/onboarding/personal-info"
      >
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
          <p className="ml-4 text-gray-400">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }

  // Adicionar verificação de erro persistente
  if (lastError && !isLoading) {
    return (
      <OnboardingLayout 
        currentStep={2} 
        title="Dados Profissionais" 
        backUrl="/onboarding/personal-info"
      >
        <Card className="p-6 mb-6 bg-red-50 text-red-700 border-red-300">
          <h3 className="text-lg font-medium mb-2">Erro ao carregar seus dados</h3>
          <p className="mb-4">{lastError.message || "Erro desconhecido ao carregar seus dados"}</p>
          <Button 
            onClick={handleRetry}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </Card>
      </OnboardingLayout>
    );
  }
  
  return (
    <OnboardingLayout 
      currentStep={2} 
      title="Dados Profissionais" 
      backUrl="/onboarding/personal-info"
    >
      {submitError && (
        <Card className="p-4 mb-6 bg-red-50 text-red-700 border-red-300">
          <p>{submitError}</p>
          <Button 
            onClick={handleRetry}
            variant="ghost" 
            size="sm"
            className="mt-2 text-red-700 hover:text-red-800 hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </Card>
      )}
      
      <ProfessionalDataStep 
        initialData={initialData} 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </OnboardingLayout>
  );
};

export default ProfessionalData;
