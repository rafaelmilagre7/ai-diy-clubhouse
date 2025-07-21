
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => Promise<void>;
  onSave: () => Promise<void>;
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
  
  const handleNext = async () => {
    try {
      await onNext();
    } catch (error) {
      console.error("Erro ao avançar para próxima etapa:", error);
      // Erro já tratado no onNext, não duplicar toast
    }
  };

  const handleSave = async () => {
    try {
      await onSave();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      // Erro já tratado no onSave, não duplicar toast
    }
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
          onClick={handleSave}
          disabled={saving}
          className="flex items-center bg-green-600 hover:bg-green-700"
        >
          <Globe className="w-4 h-4 mr-2" />
          {saving ? "Publicando..." : "Publicar Solução"}
        </Button>
      ) : (
        <Button
          onClick={handleNext}
          disabled={saving}
          className="flex items-center bg-primary hover:bg-primary/90"
        >
          {saving ? "Salvando..." : "Próximo"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
