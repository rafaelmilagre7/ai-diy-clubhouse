
import React, { ReactNode } from 'react';
import { OnboardingStep } from '@/types/onboarding';
import { Progress } from '@/components/ui/progress';
import MemberLayout from '@/components/layout/MemberLayout';
import { StepIndicator } from './StepIndicator';

export interface OnboardingLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  currentStep: number;
  totalSteps: number;
  progress?: number;
  steps?: OnboardingStep[];
  activeStep?: string;
  backUrl?: string;
  stepTitles?: string[];
  onStepClick?: (stepIdx: number) => void;
  hideProgress?: boolean;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  description,
  currentStep,
  totalSteps,
  progress = 0,
  steps = [],
  activeStep = '',
  backUrl,
  stepTitles = [],
  onStepClick,
  hideProgress = false,
}) => {
  return (
    <MemberLayout>
      <div className="min-h-screen bg-gradient-to-b from-white via-viverblue-lighter/10 to-viverblue/10">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8 space-y-4">
            <h1 className="text-3xl font-bold text-viverblue-dark font-heading">{title}</h1>
            {description && <p className="text-neutral-600">{description}</p>}
            
            {!hideProgress && (
              <>
                <div className="flex items-center justify-between mt-6">
                  <p className="text-neutral-600 font-medium">
                    Passo {currentStep} de {totalSteps}
                  </p>
                  <p className="text-viverblue font-medium">{Math.round(progress)}% concluído</p>
                </div>
                
                <Progress 
                  value={progress} 
                  className="h-2 bg-neutral-200" 
                  indicatorClassName="bg-viverblue" 
                />
              </>
            )}
            
            {stepTitles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {stepTitles.map((title, index) => (
                  <StepIndicator 
                    key={index}
                    index={index + 1}
                    title={title}
                    isActive={index + 1 === currentStep}
                    isCompleted={index + 1 < currentStep}
                    onClick={onStepClick ? () => onStepClick(index) : undefined}
                  />
                ))}
              </div>
            )}
            
            {steps.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {steps.map((step, index) => (
                  <StepIndicator 
                    key={step.id}
                    index={index + 1}
                    title={step.title}
                    isActive={step.id === activeStep}
                    isCompleted={index + 1 < currentStep}
                    onClick={onStepClick ? () => onStepClick(index) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-md">
            {children}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default OnboardingLayout;
