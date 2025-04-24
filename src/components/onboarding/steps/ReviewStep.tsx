
import React from "react";
import { OnboardingProgress } from "@/types/onboarding";
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
  // Introduzir um hook para garantir renderização completa após dados carregados
  const [processedData, setProcessedData] = React.useState<OnboardingProgress | null>(null);
  
  // Processar dados quando o progress mudar
  React.useEffect(() => {
    if (!progress) return;
    
    console.log("[ReviewStep] Processando dados de progresso:", progress);
    
    // Função para garantir que objetos JSONB sejam parseados corretamente
    const processProgressData = (data: OnboardingProgress): OnboardingProgress => {
      const processed = { ...data };
      
      // Lista de campos que podem precisar de processamento
      const fieldsToProcess = [
        'personal_info', 
        'professional_info', 
        'business_context',
        'business_goals',
        'ai_experience',
        'experience_personalization',
        'complementary_info'
      ];
      
      // Processar cada campo
      fieldsToProcess.forEach(field => {
        const key = field as keyof OnboardingProgress;
        const value = processed[key];
        
        if (value) {
          // Se for string, tentar converter para objeto
          if (typeof value === 'string' && value !== "") {
            try {
              processed[key] = JSON.parse(value as string);
              console.log(`[ReviewStep] Campo ${field} convertido de string para objeto:`, processed[key]);
            } catch (e) {
              console.error(`[ReviewStep] Erro ao converter string para objeto no campo ${field}:`, e);
            }
          } else if (typeof value === 'object') {
            console.log(`[ReviewStep] Campo ${field} já é um objeto:`, value);
          }
        }
      });
      
      return processed;
    };
    
    // Processar dados e atualizar estado
    const processed = processProgressData(progress);
    setProcessedData(processed);
    
  }, [progress]);

  if (!progress) return <div>Carregando dados...</div>;
  
  // Usar dados processados ou fallback para dados originais
  const dataToUse = processedData || progress;

  // Verifica se todos os passos necessários foram concluídos
  // Exclui etapas de review e geração de trilha
  const allStepsCompleted = steps
    .filter(step => step.id !== "review" && step.id !== "trail_generation")
    .every(step => progress.completed_steps && Array.isArray(progress.completed_steps) && progress.completed_steps.includes(step.id));

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
            let sectionData = dataToUse[sectionKey];

            // Log para depuração
            console.log(`[ReviewStep] Processando seção ${step.id}, dados:`, sectionData);
            console.log(`[ReviewStep] Tipo de dados para ${step.section}:`, typeof sectionData);
            
            // Tratamento especial para business_context que pode estar em business_data
            if (step.section === "business_context" && (!sectionData || Object.keys(sectionData || {}).length === 0)) {
              const fallbackData = dataToUse.business_data;
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
              if (dataToUse.company_name || dataToUse.company_size || dataToUse.company_sector) {
                const directData = {
                  company_name: dataToUse.company_name || "",
                  company_size: dataToUse.company_size || "",
                  company_sector: dataToUse.company_sector || "",
                  company_website: dataToUse.company_website || "",
                  current_position: dataToUse.current_position || "",
                  annual_revenue: dataToUse.annual_revenue || "",
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
          disabled={isSubmitting}
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
