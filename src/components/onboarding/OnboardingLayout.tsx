
import React from "react";
import MemberLayout from "@/components/layout/MemberLayout";
import { OnboardingHeader } from "./OnboardingHeader";
import { useNavigate } from "react-router-dom";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  currentStep: number;
  backUrl?: string;
  onBackClick?: () => void; // Adicionada função de callback para navegação
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  currentStep,
  backUrl,
  onBackClick
}) => {
  const navigate = useNavigate();

  // Função padronizada para navegação
  const handleBack = () => {
    if (onBackClick) {
      // Se tiver callback específico, usar ele
      console.log("[OnboardingLayout] Navegando de volta via callback");
      onBackClick();
    } else if (backUrl) {
      // Se tiver URL específica, usar ela
      console.log(`[OnboardingLayout] Navegando de volta para ${backUrl}`);
      navigate(backUrl);
    } else {
      // Fallback para comportamento padrão
      console.log("[OnboardingLayout] Navegação padrão para trás");
      navigate(-1);
    }
  };

  return (
    <MemberLayout>
      <div className="w-full bg-white py-6">
        <div className="container max-w-screen-lg">
          <OnboardingHeader 
            isOnboardingCompleted={false} 
            title={title}
            step={currentStep}
            onBackClick={backUrl || onBackClick ? handleBack : undefined}
          />
        </div>
      </div>

      <div className="container max-w-screen-lg mx-auto py-8">
        {children}
      </div>
    </MemberLayout>
  );
};
