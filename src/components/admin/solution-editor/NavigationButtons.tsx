
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  saving: boolean;
}

/**
 * Componente de navegação entre etapas do editor de solução
 * Provê botões para avançar/retroceder nas etapas
 * Adapta-se ao contexto da etapa atual (última etapa mostra publicação)
 */
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
    // Primeiro salva os dados e depois avança
    onSave();
    // Adicionamos um pequeno delay para garantir que o salvamento ocorra antes de avançar
    setTimeout(() => {
      onNext();
      toast({
        title: "Avançando para a próxima etapa",
        description: "Seus dados foram salvos com sucesso."
      });
    }, 500);
  };
  
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
      
      {isLastStep ? (
        <Button
          onClick={onSave}
          disabled={saving}
          className="flex items-center bg-green-600 hover:bg-green-700"
        >
          <Globe className="w-4 h-4 mr-2" />
          Publicar Solução
        </Button>
      ) : (
        <Button
          onClick={handleNext}
          disabled={saving}
          className="flex items-center bg-primary hover:bg-primary/90"
        >
          Próximo
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
