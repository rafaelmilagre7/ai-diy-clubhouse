
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface OnboardingIncompleteStateProps {
  onNavigateToOnboarding: () => void;
}

export const OnboardingIncompleteState: React.FC<OnboardingIncompleteStateProps> = ({ 
  onNavigateToOnboarding 
}) => {
  return (
    <div className="flex flex-col items-center text-center p-8">
      <h3 className="text-xl font-semibold mb-4">Complete seu Perfil de Implementação</h3>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        Para gerar sua trilha personalizada de implementação, precisamos conhecer melhor 
        seu negócio e seus objetivos.
      </p>
      
      <Button 
        onClick={onNavigateToOnboarding} 
        className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 mt-2"
      >
        Completar Perfil de Implementação
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};
