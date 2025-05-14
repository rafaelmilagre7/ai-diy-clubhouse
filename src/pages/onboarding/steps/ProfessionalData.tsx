
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ProfessionalDataStep } from "@/components/onboarding/steps/ProfessionalDataStep";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { professionalDataService } from "@/services/onboarding";
import { Card } from "@/components/ui/card";

const ProfessionalData = () => {
  const navigate = useNavigate();
  const { progress, isLoading, refreshProgress, lastError } = useProgress();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  
  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        if (progress) {
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
        }
      } catch (error) {
        console.error("Erro ao carregar dados profissionais:", error);
        toast.error("Erro ao carregar seus dados", {
          description: "Atualize a página para tentar novamente"
        });
      }
    };
    
    if (!isLoading) {
      loadData();
    }
  }, [progress, isLoading]);
  
  // Função para submeter os dados com tratamento de erros melhorado
  const handleSubmit = async (stepId: string, data: any): Promise<void> => {
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
      
      let retryCount = 0;
      const maxRetries = 2;
      let success = false;
      
      while (!success && retryCount <= maxRetries) {
        try {
          // Atualizar os dados na tabela de onboarding_progress
          await professionalDataService.save(progress.id, progress.user_id, data);
          success = true;
        } catch (saveError: any) {
          retryCount++;
          console.warn(`Tentativa ${retryCount} falhou:`, saveError);
          
          if (retryCount > maxRetries) {
            throw saveError;
          }
          
          // Pequena espera entre tentativas
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Recarregar o progresso para refletir as alterações
      await refreshProgress();
      
      // Navegar para a próxima etapa
      navigate("/onboarding/business-context");
      
      toast.success("Dados salvos com sucesso", {
        description: "Redirecionando para a próxima etapa..."
      });
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
  
  return (
    <OnboardingLayout 
      currentStep={2} 
      title="Dados Profissionais" 
      backUrl="/onboarding/personal-info"
    >
      {submitError && (
        <Card className="p-4 mb-6 bg-red-100 text-red-700 border-red-300">
          <p>{submitError}</p>
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
