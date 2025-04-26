
import React, { useEffect, useState, useMemo } from "react";
import { OnboardingProgress } from "@/types/onboarding";
import { ReviewData } from "@/types/reviewTypes";
import { steps } from "@/hooks/onboarding/useStepDefinitions";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewSectionCard } from "./ReviewSectionCard";
import { Card } from "@/components/ui/card";

interface ReviewStepProps {
  progress: OnboardingProgress | null;
  onComplete: () => void;
  isSubmitting: boolean;
  navigateToStep: (index: number) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  progress,
  onComplete,
  isSubmitting,
  navigateToStep,
}) => {
  // Estado com tipagem explícita para dados processados
  const [processedData, setProcessedData] = useState<ReviewData | null>(null);
  const [processingComplete, setProcessingComplete] = useState<boolean>(false);
  
  // Efeito para processar dados apenas quando progresso mudar, com manejo de erros
  useEffect(() => {
    if (!progress) {
      console.warn("[ReviewStep] Dados de progresso não disponíveis");
      setProcessingComplete(true);
      return;
    }
    
    try {
      console.log("[ReviewStep] Processando dados de progresso:", progress);
      
      // Função para normalizar campos que podem estar como string
      const normalizeField = (fieldName: string, value: any) => {
        if (typeof value === 'string' && fieldName !== 'current_step' && fieldName !== 'user_id' && fieldName !== 'id') {
          console.log(`[ReviewStep] Tentando normalizar campo ${fieldName} que está como string:`, value);
          
          // Tentativa de converter string para objeto
          try {
            if (value && value !== "{}" && value !== "") {
              const parsed = JSON.parse(value);
              console.log(`[ReviewStep] Campo ${fieldName} convertido de string para objeto:`, parsed);
              return parsed;
            }
          } catch (e) {
            console.error(`[ReviewStep] Falha ao converter string para objeto no campo ${fieldName}:`, e);
          }
        }
        return value;
      };
      
      // Criar uma cópia profunda do progresso para não modificar o original
      const normalizedProgress = { ...progress };
      
      // Verificar e normalizar campos principais
      const fieldsToNormalize = [
        'ai_experience', 
        'business_goals', 
        'experience_personalization', 
        'complementary_info',
        'professional_info', 
        'business_data', 
        'business_context',
        'personal_info'
      ];
      
      // Aplicar normalização a todos os campos listados
      fieldsToNormalize.forEach(field => {
        if (progress[field as keyof typeof progress]) {
          const normalizedValue = normalizeField(field, progress[field as keyof typeof progress]);
          (normalizedProgress as any)[field] = normalizedValue;
        }
      });
      
      setProcessedData(normalizedProgress as ReviewData);
    } catch (error) {
      console.error("[ReviewStep] Erro ao processar dados:", error);
    } finally {
      setProcessingComplete(true);
    }
  }, [progress]);

  // Usar dados processados ou fallback para dados originais
  const dataToUse = useMemo(() => {
    return processedData || progress;
  }, [processedData, progress]);

  // Se ainda não tivermos dados e o processamento estiver completo, mostrar mensagem de erro
  if (!dataToUse && processingComplete) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700">Erro ao carregar dados para revisão. Por favor, recarregue a página ou volte às etapas anteriores.</p>
      </div>
    );
  }

  // Se os dados estiverem sendo processados, mostrar estado de carregamento
  if (!processingComplete) {
    return <div className="py-4 text-gray-600">Processando informações...</div>;
  }

  // Verifica se todos os passos necessários foram concluídos
  // Exclui etapas de review e geração de trilha
  const allStepsCompleted = steps
    .filter(step => step.id !== "review" && step.id !== "trail_generation")
    .every(step => {
      if (!progress?.completed_steps || !Array.isArray(progress.completed_steps)) {
        return false;
      }
      return progress.completed_steps.includes(step.id);
    });

  return (
    <div className="space-y-6">
      <Card className="bg-[#0ABAB5]/10 p-4 rounded-md border border-[#0ABAB5]/20">
        <p className="text-gray-700">
          Revise todas as informações preenchidas. Após confirmar, sua trilha personalizada será gerada automaticamente.
          Esta trilha será única e adaptada para o seu perfil de negócios.
        </p>
      </Card>

      <div className="space-y-4">
        {steps
          .filter((step) => step.id !== "review" && step.id !== "trail_generation")
          .map((step, idx) => {
            const sectionKey = step.section as keyof OnboardingProgress;
            let sectionData = dataToUse && dataToUse[sectionKey];

            // Log para depuração
            console.log(`[ReviewStep] Processando seção ${step.id}, dados:`, sectionData);
            
            // Tratamento especial para business_context que pode estar em business_data
            if (step.section === "business_context" && (!sectionData || Object.keys(sectionData || {}).length === 0)) {
              const fallbackData = dataToUse?.business_data;
              if (fallbackData) {
                if (typeof fallbackData === 'string') {
                  try {
                    sectionData = JSON.parse(fallbackData);
                    console.log("[ReviewStep] business_context parseado de string:", sectionData);
                  } catch (e) {
                    console.error("[ReviewStep] Erro ao parser business_data como fallback:", e);
                  }
                } else {
                  sectionData = fallbackData;
                  console.log("[ReviewStep] Usando business_data como fallback para business_context:", sectionData);
                }
              }
            }

            // Tratamento especial para dados profissionais
            if (step.section === "professional_info" && (!sectionData || Object.keys(sectionData || {}).length === 0)) {
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
            
            // Último esforço de normalização para garantir que temos um objeto e não uma string
            if (typeof sectionData === 'string' && sectionData !== "" && sectionData !== "{}") {
              try {
                sectionData = JSON.parse(sectionData);
                console.log(`[ReviewStep] Parseando string para objeto na renderização final:`, sectionData);
              } catch (e) {
                console.error(`[ReviewStep] Erro ao tentar parsear string:`, e, sectionData);
              }
            }
            
            // Passamos o índice real (começando em 1) para a UI
            const stepIndex = idx + 1;

            return (
              <ReviewSectionCard
                key={step.id}
                step={step}
                sectionData={sectionData || {}}
                progress={dataToUse}
                stepIndex={stepIndex}
                navigateToStep={navigateToStep}
              />
            );
          })}
      </div>

      {!allStepsCompleted && (
        <Card className="bg-amber-50 p-4 border border-amber-200">
          <p className="text-amber-700">
            <strong>Atenção:</strong> Algumas seções ainda não foram preenchidas. Recomendamos completar todas as seções antes de prosseguir para obter a melhor experiência personalizada.
          </p>
        </Card>
      )}

      <div className="pt-6 flex justify-end">
        <Button
          onClick={onComplete}
          disabled={isSubmitting || !dataToUse}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
        >
          {isSubmitting ? "Processando..." : (
            <span className="flex items-center gap-2">
              Concluir e Gerar Minha Trilha
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
