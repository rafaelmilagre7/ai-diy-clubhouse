
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, ArrowRight, Loader2 } from "lucide-react";

interface OnboardingIncompleteStateProps {
  onNavigateToOnboarding: () => void;
  onForceComplete?: () => void;
  isForceCompleting?: boolean;
}

export const OnboardingIncompleteState: React.FC<OnboardingIncompleteStateProps> = ({ 
  onNavigateToOnboarding,
  onForceComplete,
  isForceCompleting = false
}) => {
  return (
    <div className="space-y-6">
      <Alert className="bg-[#151823]/80 border-[#0ABAB5]/30 text-white">
        <Lightbulb className="h-5 w-5 text-[#0ABAB5]" />
        <AlertTitle className="text-white font-semibold text-lg">
          Complete o onboarding para acessar sua trilha personalizada
        </AlertTitle>
        <AlertDescription className="text-neutral-300 mt-2">
          <p className="mb-4">
            Para criar sua trilha de implementação personalizada, precisamos conhecer melhor
            você e seu negócio. Complete o processo de onboarding para desbloquear 
            recomendações exclusivas para seu caso.
          </p>
          
          <div className="flex flex-wrap gap-3 mt-2">
            <Button
              onClick={onNavigateToOnboarding}
              className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-white"
            >
              Ir para Onboarding
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            {onForceComplete && (
              <Button
                variant="outline"
                disabled={isForceCompleting}
                onClick={onForceComplete}
                className="border-[#0ABAB5]/30 text-[#0ABAB5] hover:bg-[#0ABAB5]/10"
              >
                {isForceCompleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Já completei o onboarding"
                )}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
      
      <div className="p-4 border border-neutral-700/50 rounded-lg bg-[#151823]/60 text-neutral-200">
        <h3 className="text-lg font-medium mb-2 text-white">Por que completar o onboarding?</h3>
        <ul className="space-y-2 ml-4 list-disc text-neutral-300">
          <li>Receba soluções de IA personalizadas para seu negócio</li>
          <li>Priorize implementações com maior impacto para seus objetivos</li>
          <li>Obtenha uma jornada estruturada para implementar IA com sucesso</li>
          <li>Acesse conteúdo personalizado baseado em seu setor e experiência</li>
        </ul>
      </div>
    </div>
  );
};
