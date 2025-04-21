
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { getSummary } from "./ReviewUtils";
import { OnboardingProgress } from "@/types/onboarding";

interface ReviewSectionCardProps {
  step: {
    id: string;
    title: string;
    section: string;
  };
  sectionData: any;
  progress: OnboardingProgress;
  stepIndex: number;
  navigateToStep: (index: number) => void;
}

export const ReviewSectionCard: React.FC<ReviewSectionCardProps> = ({
  step,
  sectionData,
  progress,
  stepIndex,
  navigateToStep,
}) => {
  const handleEditClick = () => {
    console.log(`Navegando para etapa ${step.id}, índice na árvore: ${stepIndex}`);
    // Usar o índice correto para navegação (índice começa em 0)
    navigateToStep(stepIndex);
  };

  return (
    <Card key={step.id} className="overflow-hidden border border-gray-200 shadow-sm">
      <CardHeader className="bg-gray-50 pb-3 pt-4 px-4 flex flex-row justify-between items-center">
        <CardTitle className="text-base font-medium text-gray-800">
          {step.title}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[#0ABAB5] border-[#0ABAB5] hover:bg-[#0ABAB5]/10"
          onClick={handleEditClick}
        >
          <Edit className="h-4 w-4 mr-1" /> Editar
        </Button>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        {sectionData ? getSummary(step.section, sectionData, progress) : (
          <div className="text-gray-500 italic flex items-center space-x-2">
            <span className="inline-block w-2 h-2 bg-amber-500 rounded-full"></span>
            <span>Nenhuma informação preenchida. Clique em Editar para adicionar.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
