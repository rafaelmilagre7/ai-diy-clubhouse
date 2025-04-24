
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  saving: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSave,
  saving,
}) => {
  const isLastStep = currentStep === totalSteps - 1;
  const { toast } = useToast();
  
  const handleNext = () => {
    onSave();
    setTimeout(() => {
      onNext();
      toast({
        title: "Avançando para a próxima etapa",
        description: "Seus dados foram salvos com sucesso."
      });
    }, 500);
  };
  
  if (isLastStep) {
    return null; // Não exibir botões de navegação na última aba (Publicar)
  }
  
  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0 || saving}
        className="flex items-center"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Anterior
      </Button>
      
      <Button
        onClick={handleNext}
        disabled={saving}
        className="flex items-center bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
      >
        Próximo
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
