
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface OnboardingIncompleteStateProps {
  onNavigateToOnboarding: () => void;
}

export const OnboardingIncompleteState: React.FC<OnboardingIncompleteStateProps> = ({
  onNavigateToOnboarding
}) => {
  return (
    <div className="text-center py-12 space-y-6">
      <div className="flex justify-center">
        <div className="bg-amber-100 p-4 rounded-full">
          <AlertTriangle className="h-12 w-12 text-amber-600" />
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">
          Complete seu Onboarding Primeiro
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Para gerar sua trilha de implementação personalizada, você precisa completar 
          todas as etapas do onboarding. Isso nos permite entender melhor seus objetivos 
          e criar recomendações específicas para seu negócio.
        </p>
      </div>
      
      <div className="space-y-4">
        <Button 
          onClick={onNavigateToOnboarding}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-white px-6 py-3"
          size="lg"
        >
          <ArrowRight className="mr-2 h-5 w-5" />
          Completar Onboarding
        </Button>
        
        <div className="text-sm text-gray-500">
          <p>Tempo estimado: 10-15 minutos</p>
        </div>
      </div>
    </div>
  );
};
