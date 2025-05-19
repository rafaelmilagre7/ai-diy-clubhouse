
import React, { useEffect, useState, useMemo } from "react";
import { OnboardingProgress } from "@/types/onboarding";
import { ReviewData } from "@/types/reviewTypes";
import { steps } from "@/hooks/onboarding/useStepDefinitions";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewSectionCard } from "./ReviewSectionCard";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useReviewDataProcessor } from "./review-hooks/useReviewDataProcessor";
import { useDataIntegrityCheck } from "./review-hooks/useDataIntegrityCheck";

interface ReviewStepProps {
  progress: OnboardingProgress | null;
  onComplete: () => void;
  isSubmitting: boolean;
  navigateToStep: (stepId: string) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  progress,
  onComplete,
  isSubmitting,
  navigateToStep,
}) => {
  // Utilizando hooks extraídos para processar dados e verificar integridade
  const { processedData, processingComplete, dataToUse } = useReviewDataProcessor(progress);
  const { missingSteps, dataIntegrityChecked } = useDataIntegrityCheck(dataToUse);

  // Função melhorada para manipular a finalização
  const handleComplete = () => {
    // Verificar se há dados básicos disponíveis
    if (!dataToUse) {
      toast.error("Dados necessários não disponíveis. Por favor, recarregue a página.");
      return;
    }
    
    // Adicionar mensagem de feedback ao usuário
    if (progress?.is_completed) {
      toast.info("Atualizando sua trilha personalizada...");
    }
    
    // Forçar prosseguimento: ignorar verificação de etapas faltantes
    // Isso permite que o usuário continue mesmo se o sistema ainda achar que algo está faltando
    onComplete();
  };

  // Se ainda não tivermos dados e o processamento estiver completo, mostrar mensagem de erro
  if (!dataToUse && processingComplete) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-800 rounded-md">
        <p className="text-red-400">Erro ao carregar dados para revisão. Por favor, recarregue a página ou volte às etapas anteriores.</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline" 
          className="mt-2 border-red-800 text-red-400 hover:bg-red-900/50"
        >
          Recarregar página
        </Button>
      </div>
    );
  }

  // Se os dados estiverem sendo processados, mostrar estado de carregamento
  if (!processingComplete) {
    return (
      <div className="py-6 flex flex-col items-center text-neutral-400">
        <Loader2 className="h-8 w-8 animate-spin mb-2 text-viverblue" />
        <p>Processando informações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReviewSections 
        steps={steps} 
        dataToUse={dataToUse} 
        missingSteps={missingSteps} 
        navigateToStep={navigateToStep} 
      />

      {!dataIntegrityChecked && (
        <Card className="bg-blue-900/20 p-4 border border-blue-700/50">
          <p className="text-blue-300">
            <strong>Verificando dados...</strong> Por favor, aguarde enquanto verificamos se todas as informações estão completas.
          </p>
        </Card>
      )}

      {missingSteps.length > 0 && dataIntegrityChecked && (
        <Card className="bg-amber-900/30 p-4 border border-amber-700">
          <p className="text-amber-400">
            <strong>Atenção:</strong> Algumas seções importantes parecem estar incompletas. Recomendamos completar todas as seções antes de prosseguir para obter a melhor experiência personalizada.
          </p>
        </Card>
      )}

      <div className="pt-8 flex justify-end">
        <Button
          onClick={handleComplete}
          disabled={isSubmitting}
          size="lg"
          className="bg-viverblue hover:bg-viverblue-dark text-white px-8 py-6 text-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processando...
            </span>
          ) : progress?.is_completed ? (
            <span className="flex items-center gap-2">
              Atualizar Minha Trilha
              <ArrowRight className="h-5 w-5" />
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Concluir e Gerar Minha Trilha
              <ArrowRight className="h-5 w-5" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

// Componente extraído para renderizar as seções de revisão
interface ReviewSectionsProps {
  steps: Array<any>;
  dataToUse: any;
  missingSteps: string[];
  navigateToStep: (stepId: string) => void;
}

const ReviewSections: React.FC<ReviewSectionsProps> = ({ 
  steps, 
  dataToUse, 
  missingSteps, 
  navigateToStep 
}) => {
  return (
    <div className="space-y-4">
      {steps
        .filter((step) => step.id !== "review" && step.id !== "trail_generation")
        .map((step, idx) => {
          const sectionKey = step.section as keyof OnboardingProgress;
          let sectionData = dataToUse && dataToUse[sectionKey];
          
          // Processamento de dados específicos para cada seção
          sectionData = processSpecificSectionData(step.section, sectionData, dataToUse);
          
          // Garante que sectionData seja sempre um objeto (nunca undefined ou null)
          const safeData = sectionData || {};
          
          // Highlight se for uma etapa faltante
          const isMissingStep = missingSteps.includes(step.id);
          
          // Passamos o índice real (começando em 1) para a UI
          const stepIndex = idx + 1;

          return (
            <ReviewSectionCard
              key={step.id}
              step={step}
              sectionData={safeData}
              progress={dataToUse}
              stepIndex={stepIndex}
              navigateToStep={navigateToStep}
              highlight={isMissingStep}
            />
          );
        })}
    </div>
  );
};

// Função auxiliar para processar dados específicos de cada seção
const processSpecificSectionData = (section: string, sectionData: any, dataToUse: any) => {
  switch (section) {
    // Tratamento especial para business_context que pode estar em business_data
    case 'business_context':
      if (!sectionData || Object.keys(sectionData || {}).length === 0) {
        const fallbackData = dataToUse?.business_data;
        if (fallbackData) {
          if (typeof fallbackData === 'string') {
            try {
              sectionData = JSON.parse(fallbackData);
            } catch (e) {
              console.error("[ReviewStep] Erro ao parser business_data como fallback:", e);
            }
          } else {
            sectionData = fallbackData;
          }
          console.log("[ReviewStep] Usando business_data como fallback para business_context:", sectionData);
        }
      }
      break;
    
    // Tratamento especial para dados profissionais
    case 'professional_info':
      if (!sectionData || Object.keys(sectionData || {}).length === 0) {
        // Construir um objeto com dados diretos como fallback
        if (dataToUse?.company_name || dataToUse?.company_size || dataToUse?.company_sector) {
          const directData = {
            company_name: dataToUse?.company_name || "",
            company_size: dataToUse?.company_size || "",
            company_sector: dataToUse?.company_sector || "",
            company_website: dataToUse?.company_website || "",
            current_position: dataToUse?.current_position || "",
            annual_revenue: dataToUse?.annual_revenue || "",
          };
          
          // Se algum dos campos diretos tiver valor, usar esses dados
          if (Object.values(directData).some(value => !!value)) {
            sectionData = directData;
            console.log("[ReviewStep] Usando dados diretos para professional_info:", sectionData);
          }
        }
      }
      break;
    
    default:
      // Nenhum tratamento especial para outras seções
      break;
  }
  
  // Último esforço de normalização para garantir que temos um objeto e não uma string
  if (typeof sectionData === 'string' && sectionData !== "" && sectionData !== "{}") {
    try {
      sectionData = JSON.parse(sectionData);
      console.log(`[ReviewStep] Parseando string para objeto na renderização final:`, sectionData);
    } catch (e) {
      console.error(`[ReviewStep] Erro ao tentar parsear string:`, e, sectionData);
    }
  }
  
  return sectionData;
};
