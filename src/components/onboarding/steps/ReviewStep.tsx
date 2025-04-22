
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
  if (!progress) return <div>Carregando dados...</div>;

  // A função findStepIndex foi corrigida para retornar o índice correto (baseado em zero)
  const findStepIndex = (sectionId: string) => {
    return steps.findIndex((s) => s.id === sectionId);
  };

  // Verifica se todos os passos necessários foram concluídos
  // Exclui etapas de review e geração de trilha
  const allStepsCompleted = steps
    .filter(step => step.id !== "review" && step.id !== "trail_generation")
    .every(step => progress.completed_steps && Array.isArray(progress.completed_steps) && progress.completed_steps.includes(step.id));

  // Depurar progresso para entender melhor os dados disponíveis
  console.log("Dados de progresso na ReviewStep:", progress);

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
          .map((step) => {
            const sectionKey = step.section as keyof OnboardingProgress;
            let sectionData = progress[sectionKey];

            // Log para depuração
            console.log(`Passo ${step.id}, seção ${step.section}, dados:`, sectionData);

            // Tratamento especial para business_context que pode estar em business_data
            if (step.section === "business_context" && (!sectionData || Object.keys(sectionData || {}).length === 0)) {
              sectionData = progress.business_data;
              console.log("Usando business_data como fallback para business_context:", sectionData);
            }

            // Tratamento especial para dados pessoais
            if (step.section === "personal_info" && (!sectionData || Object.keys(sectionData || {}).length === 0)) {
              if (progress.personal_info) {
                sectionData = progress.personal_info;
                console.log("Usando personal_info:", sectionData);
              }
            }

            // Tratamento especial para dados profissionais
            if (step.section === "professional_info" && (!sectionData || Object.keys(sectionData || {}).length === 0)) {
              // Verificar se há dados diretos no progresso
              const directData = {
                company_name: progress.company_name || "",
                company_size: progress.company_size || "",
                company_sector: progress.company_sector || "",
                company_website: progress.company_website || "",
                current_position: progress.current_position || "",
                annual_revenue: progress.annual_revenue || "",
              };
              
              // Se algum dos campos diretos tiver valor, usar esses dados
              if (Object.values(directData).some(value => !!value)) {
                sectionData = directData;
                console.log("Usando dados diretos para professional_info:", sectionData);
              }
            }
            
            // Passamos o índice real (baseado em zero) para a função navigateToStep na ReviewSectionCard
            const stepIndex = findStepIndex(step.id);
            // Mas enviamos stepIndex + 1 apenas para exibição na UI
            const displayIndex = stepIndex + 1;

            console.log(`Renderizando seção ${step.id}, índice para navegação: ${stepIndex}, índice para exibição: ${displayIndex}`);

            return (
              <ReviewSectionCard
                key={step.id}
                step={step}
                sectionData={sectionData || {}}
                progress={progress}
                stepIndex={displayIndex}
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
