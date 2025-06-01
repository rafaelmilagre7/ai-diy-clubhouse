
import React from "react";
import { Button } from "@/components/ui/button";
import { User, Sparkles, ArrowRight } from "lucide-react";

interface MinimalOnboardingIncompleteStateProps {
  onNavigateToOnboarding: () => void;
}

export const MinimalOnboardingIncompleteState: React.FC<MinimalOnboardingIncompleteStateProps> = ({
  onNavigateToOnboarding
}) => {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-amber-500/20">
          <User className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3 w-3 text-viverblue" />
            <span className="text-sm font-medium text-white">Trilha de Implementação IA</span>
          </div>
          <p className="text-xs text-neutral-400">
            Complete seu perfil para gerar recomendações personalizadas
          </p>
        </div>
      </div>
      
      <Button 
        onClick={onNavigateToOnboarding}
        className="bg-viverblue hover:bg-viverblue/90 text-white h-8 px-3 text-xs"
      >
        <ArrowRight className="mr-1 h-3 w-3" />
        Completar
      </Button>
    </div>
  );
};
