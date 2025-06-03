
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
  hideProgress?: boolean;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  currentStep,
  totalSteps = 8,
  backUrl,
  onBackClick,
  hideProgress = false
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <MemberLayout>
      <div className="w-full bg-[#0F111A] py-6">
        <div className="pl-8 pr-6 max-w-none">
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
                totalSteps={totalSteps} 
              />
            </div>
          )}
        </div>
      </div>

      <div className="pl-8 pr-6 max-w-none mx-auto py-8">
        {children}
      </div>
    </MemberLayout>
  );
};
