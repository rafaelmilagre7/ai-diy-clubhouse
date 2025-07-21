
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Globe, Loader2 } from "lucide-react";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: (stepSaveFunction?: () => Promise<void>) => Promise<void>;
  onSave: () => Promise<void>;
  saving: boolean;
  stepSaveFunction?: () => Promise<void>;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSave,
  saving,
  stepSaveFunction,
}) => {
  const isLastStep = currentStep === totalSteps - 1;
  
  const handleNext = async () => {
    try {
      console.log("🔄 NavigationButtons: Botão Próximo clicado na etapa:", currentStep);
      console.log("🔍 NavigationButtons: stepSaveFunction disponível:", !!stepSaveFunction);
      await onNext(stepSaveFunction);
    } catch (error) {
      console.error("❌ NavigationButtons: Erro no botão Próximo:", error);
    }
  };

  const handleSave = async () => {
    try {
      console.log("💾 NavigationButtons: Botão Salvar clicado");
      await onSave();
    } catch (error) {
      console.error("❌ NavigationButtons: Erro no botão Salvar:", error);
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
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publicando...
            </>
          ) : (
            <>
              <Globe className="w-4 h-4 mr-2" />
              Publicar Solução
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={handleNext}
          disabled={saving}
          className="flex items-center bg-primary hover:bg-primary/90"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
