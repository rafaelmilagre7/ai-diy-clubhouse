
import React, { ReactNode } from 'react';
import { OnboardingStep } from '@/types/onboarding';
import { Progress } from '@/components/ui/progress';
import MemberLayout from '@/components/layout/MemberLayout';
import { StepIndicator } from './StepIndicator';
import { WizardStepProgress } from './WizardStepProgress';

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
      <div className="w-full min-h-screen bg-gradient-to-b from-white via-viverblue-lighter/10 to-viverblue/10">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 md:mb-8 space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold text-viverblue-dark font-heading">{title}</h1>
              {description && <p className="text-neutral-600">{description}</p>}
              
              {!hideProgress && (
                <>
                  <div className="flex items-center justify-between mt-4">
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
                <div className="flex flex-wrap gap-2 mt-4">
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
                <div className="mt-6">
                  <WizardStepProgress
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    stepTitles={steps.map(step => step.title)}
                    onStepClick={onStepClick}
                  />
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default OnboardingLayout;
