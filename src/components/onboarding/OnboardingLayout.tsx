
import React from "react";
import { EtapasProgresso } from "./EtapasProgresso";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import MemberLayout from "@/components/layout/MemberLayout";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  title: string;
  backUrl?: string;
  onStepClick?: (step: number) => void;
  hideProgress?: boolean;
}

export const OnboardingLayout = ({
  children,
  currentStep,
  title,
  backUrl = "/onboarding",
  onStepClick,
  hideProgress = false,
}: OnboardingLayoutProps) => {
  const { navigateToStep, steps } = useOnboardingSteps();
  const navigate = useNavigate();
  
  // Função para lidar com o clique no passo
  const handleStepClick = (step: number) => {
    if (onStepClick) {
      onStepClick(step);
    } else {
      navigateToStep(step);
    }
  };
  
  // Função para voltar para a etapa anterior ou para uma URL específica
  const handleBackClick = () => {
    console.log(`Tentando voltar da etapa ${currentStep}`);
    
    if (currentStep > 1) {
      // Se não for a primeira etapa, voltar para a anterior
      const previousStepIndex = currentStep - 2; // -1 para índice baseado em zero, -1 para voltar
      console.log(`Navegando para etapa anterior: ${previousStepIndex}`);
      navigateToStep(previousStepIndex);
    } else if (backUrl) {
      // Se for a primeira etapa e temos um backUrl definido
      console.log(`Navegando para backUrl: ${backUrl}`);
      navigate(backUrl);
    } else {
      // Caso seja a primeira etapa e não tenhamos backUrl, ir para a etapa 1 (onboarding)
      console.log(`Navegando para primeira etapa: /onboarding`);
      navigate("/onboarding", { replace: true });
    }
  };
  
  // Conteúdo do Onboarding
  const onboardingContent = (
    <div className="container max-w-screen-lg py-8">
      <div className="relative mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-0 top-0 z-10"
          onClick={handleBackClick}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex justify-center">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="h-8"
          />
        </div>
      </div>

      {!hideProgress && (
        <EtapasProgresso 
          currentStep={currentStep} 
          totalSteps={8} 
          onStepClick={handleStepClick}
        />
      )}

      <div className="mt-6 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {children}
      </div>
    </div>
  );
  
  // Agora envolvemos todo o conteúdo com o MemberLayout
  return (
    <MemberLayout>
      {onboardingContent}
    </MemberLayout>
  );
};
