
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
};
