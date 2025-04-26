
import React, { useEffect, useState } from "react";
import { OnboardingIncompleteAlert } from "./OnboardingIncompleteAlert";
import { useProgress } from "@/hooks/onboarding/useProgress";

interface DashboardProps {
  children?: React.ReactNode;
}

export const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const { progress, isLoading } = useProgress();
  const [showOnboardingAlert, setShowOnboardingAlert] = useState(false);

  // Verificar se deve mostrar alerta de onboarding incompleto
  // sem causar re-renders desnecessários
  useEffect(() => {
    if (!isLoading && progress) {
      setShowOnboardingAlert(!progress.is_completed);
    }
  }, [progress, isLoading]);

  return (
    <div className="container py-6">
      {/* Mostrar alerta apenas se o onboarding não estiver completo */}
      {showOnboardingAlert && <OnboardingIncompleteAlert />}
      
      {children}
    </div>
  );
};
