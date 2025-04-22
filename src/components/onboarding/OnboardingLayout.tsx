
import React from 'react';
import { OnboardingStep } from '@/types/onboarding';
import { Progress } from '@/components/ui/progress';
import MemberLayout from '@/components/layout/MemberLayout';
import { StepIndicator } from './StepIndicator';

export interface OnboardingLayoutProps {
  children: React.ReactNode;
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
}) => {
  return (
    <MemberLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8 space-y-4">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            {description && <p className="text-gray-400">{description}</p>}
            
            <div className="flex items-center justify-between mt-8">
              <p className="text-gray-400">
                Passo {currentStep} de {totalSteps}
              </p>
              <p className="text-gray-400">{Math.round(progress)}% concluído</p>
            </div>
            
            <Progress value={progress} className="h-2" />
            
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
              <div className="flex flex-wrap gap-2 mt-4">
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
          
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            {children}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default OnboardingLayout;
