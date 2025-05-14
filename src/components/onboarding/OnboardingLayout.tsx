
import React from "react";
import MemberLayout from "@/components/layout/MemberLayout";
import { OnboardingHeader } from "./OnboardingHeader";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "./ProgressBar";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  currentStep: number;
  totalSteps?: number;
  backUrl?: string;
  onBackClick?: () => void;
  isFormacao?: boolean;
  hideProgress?: boolean;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  currentStep,
  totalSteps,
  backUrl,
  onBackClick,
  isFormacao = false,
  hideProgress = false
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
      <div className="w-full bg-[#0F111A] py-6">
        <div className="container max-w-screen-lg">
          <OnboardingHeader 
            isOnboardingCompleted={false}
            title={title}
            step={currentStep}
            onBackClick={backUrl || onBackClick ? handleBack : undefined}
          />
          
          {!hideProgress && (
            <div className="mt-6">
              <ProgressBar 
                currentStep={currentStep} 
                totalSteps={totalSteps || 8} 
              />
            </div>
          )}
        </div>
      </div>

      <div className="container max-w-screen-lg mx-auto py-8">
        {children}
      </div>
    </MemberLayout>
  );
};
