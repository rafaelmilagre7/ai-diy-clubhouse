
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface OnboardingIncompleteStateProps {
  onNavigateToOnboarding: () => void;
}

export const OnboardingIncompleteState: React.FC<OnboardingIncompleteStateProps> = ({
  onNavigateToOnboarding
}) => {
  // TEMPORÁRIO: Não mostrar mais este estado - onboarding desabilitado
  return null;
};
