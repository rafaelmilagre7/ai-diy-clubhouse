
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingProgress } from "@/types/onboarding";
import { steps } from "@/hooks/onboarding/useStepDefinitions";
import { ArrowRight, Edit } from "lucide-react";
import { getSummary } from "./ReviewUtils";

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

  // Encontra o índice de cada etapa para navegação
  const findStepIndex = (sectionId: string) => {
    return steps.findIndex((s) => s.id === sectionId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0ABAB5]/10 p-4 rounded-md border border-[#0ABAB5]/20">
        <p className="text-gray-700">
          Revise todas as informações preenchidas no seu onboarding. Caso algo esteja incorreto, clique no botão "Editar" ao lado da seção correspondente.
        </p>
      </div>

      <div className="space-y-4">
        {steps
          .filter((step) => step.id !== "review")
          .map((step) => {
            const sectionKey = step.section as keyof OnboardingProgress;
            let sectionData = progress[sectionKey];

            // Correção para business_context/business_data
            if (step.section === "business_context" && !sectionData) {
              sectionData = progress.business_data;
            }

            const stepIndex = findStepIndex(step.id);

            return (
              <Card key={step.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-3 pt-4 px-4 flex flex-row justify-between items-center">
                  <CardTitle className="text-base font-medium">{step.title}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => navigateToStep(stepIndex)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Editar
                  </Button>
                </CardHeader>
                <CardContent className="pt-4">
                  {getSummary(step.section, sectionData, progress)}
                </CardContent>
              </Card>
            );
          })}
      </div>

      <div className="pt-6 flex justify-end">
        <Button
          onClick={onComplete}
          disabled={isSubmitting}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
        >
          {isSubmitting ? "Processando..." : (
            <span className="flex items-center gap-2">
              Concluir Onboarding
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
