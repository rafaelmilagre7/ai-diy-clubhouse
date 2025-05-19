
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Map, FileSpreadsheet, ArrowRight } from "lucide-react";
import { FadeTransition } from "../transitions/FadeTransition";

interface OnboardingIncompleteStateProps {
  onNavigateToOnboarding: () => void;
  onForceComplete: () => void;
  isForceCompleting: boolean;
}

export const OnboardingIncompleteState: React.FC<OnboardingIncompleteStateProps> = ({
  onNavigateToOnboarding,
  onForceComplete,
  isForceCompleting
}) => {
  return (
    <FadeTransition>
      <div className="flex flex-col items-center py-8 px-4 max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-amber-900/20 flex items-center justify-center mb-6">
          <FileSpreadsheet className="h-8 w-8 text-amber-500" />
        </div>
        
        <h3 className="text-2xl font-bold mb-3 text-white">
          Complete seu onboarding
        </h3>
        
        <p className="text-neutral-300 mb-6 max-w-md">
          Para criar sua trilha personalizada de implementação, precisamos coletar algumas informações sobre você e seu negócio.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md">
          <Button 
            variant="default"
            onClick={onNavigateToOnboarding}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-medium py-6 h-auto"
          >
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Preencher Formulário
          </Button>
          
          <Button
            variant="outline"
            onClick={onForceComplete}
            disabled={isForceCompleting}
            className="border-neutral-700 hover:bg-neutral-800 hover:text-white py-6 h-auto"
          >
            {isForceCompleting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Map className="mr-2 h-5 w-5" />
                Pular para Trilha
              </>
            )}
          </Button>
        </div>
        
        <div className="mt-8 rounded-lg bg-neutral-800/30 border border-neutral-800 p-4 max-w-md">
          <p className="text-sm text-neutral-400 flex items-center">
            <ArrowRight className="h-4 w-4 mr-2 text-amber-500" />
            O preenchimento do onboarding permite uma experiência personalizada baseada no seu perfil
          </p>
        </div>
      </div>
    </FadeTransition>
  );
};
