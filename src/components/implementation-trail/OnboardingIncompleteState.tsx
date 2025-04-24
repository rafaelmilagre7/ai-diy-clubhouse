
import React from "react";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";

interface OnboardingIncompleteStateProps {
  onNavigateToOnboarding: () => void;
}

export const OnboardingIncompleteState: React.FC<OnboardingIncompleteStateProps> = ({
  onNavigateToOnboarding,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
        <ClipboardList className="h-8 w-8 text-orange-500" />
      </div>
      
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold">Onboarding não concluído</h3>
        <p className="text-muted-foreground">
          Para criar sua trilha personalizada de implementação, precisamos conhecer um pouco mais sobre você e seu negócio.
        </p>
      </div>
      
      <Button 
        onClick={onNavigateToOnboarding}
        className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
      >
        Completar Onboarding
      </Button>
    </div>
  );
};
