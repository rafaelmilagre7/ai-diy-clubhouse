
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { getSummary } from "./ReviewUtils";
import { OnboardingProgress, OnboardingStep } from "@/types/onboarding";

interface ReviewSectionCardProps {
  step: OnboardingStep;
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
  navigateToStep
}) => {
  const handleEdit = () => {
    navigateToStep(stepIndex - 1); // Ajustando o índice (a UI mostra 1-based, mas a navegação é 0-based)
  };

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm">
      <CardHeader className="bg-gray-50 pb-3 pt-4 px-4 flex flex-row justify-between items-center">
        <CardTitle className="text-base font-medium text-gray-800">
          {step.title}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[#0ABAB5] border-[#0ABAB5] hover:bg-[#0ABAB5]/10"
          onClick={handleEdit}
        >
          <Edit className="h-4 w-4 mr-1" /> Editar
        </Button>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        {getSummary(step.section, sectionData, progress)}
      </CardContent>
    </Card>
  );
};
