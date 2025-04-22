
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
  // Processa os dados da seção para garantir que estejam no formato correto
  const processedData = React.useMemo(() => {
    let data = sectionData;
    
    // Se os dados forem uma string, tentar converter para objeto
    if (typeof data === 'string' && data !== "{}" && data !== "") {
      try {
        data = JSON.parse(data);
        console.log(`Convertido dados da seção ${step.id} de string para objeto:`, data);
      } catch (e) {
        console.error(`Erro ao converter dados da seção ${step.id} de string para objeto:`, e);
        data = {};
      }
    }
    
    // Verificar se os dados estão vazios
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      console.warn(`Dados vazios para seção ${step.id}`);
    }
    
    return data;
  }, [sectionData, step.id]);
  
  // Validação dos dados para efeito de log
  React.useEffect(() => {
    console.log(`Revisando dados para seção ${step.id}:`, processedData);
  }, [step.id, processedData]);

  const handleEdit = () => {
    try {
      // Usando o índice correto (baseado em zero) para navegação
      const indexToNavigate = stepIndex - 1;
      console.log(`Navegando para o passo ${indexToNavigate}, originalmente ${stepIndex}`);
      navigateToStep(indexToNavigate);
    } catch (error) {
      console.error("Erro ao navegar para etapa:", error);
    }
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
        {getSummary(step.section, processedData, progress)}
      </CardContent>
    </Card>
  );
};
