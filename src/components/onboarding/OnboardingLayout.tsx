
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { WizardStepProgress } from './WizardStepProgress';
import MemberLayout from '@/components/layout/MemberLayout';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  title: string;
  description?: string;
  backUrl?: string;
  totalSteps?: number;
  stepTitles?: string[];
  onStepClick?: (step: number) => void;
  hideProgress?: boolean;
  progress?: number;
}

export const OnboardingLayout = ({
  children,
  currentStep,
  title,
  description,
  backUrl,
  totalSteps = 8,
  stepTitles = [
    "Dados Pessoais",
    "Dados Profissionais",
    "Contexto do Negócio",
    "Experiência com IA",
    "Objetivos do Clube",
    "Personalização",
    "Informações Complementares",
    "Revisão"
  ],
  onStepClick,
  hideProgress = false,
  progress
}: OnboardingLayoutProps) => {
  return (
    <MemberLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <header className="mb-8 space-y-4">
            {backUrl && (
              <Link 
                to={backUrl}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Voltar
              </Link>
            )}
            
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
              {description && (
                <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">{description}</p>
              )}
            </div>
            
            {!hideProgress && (
              <div className="space-y-4">
                <WizardStepProgress
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  stepTitles={stepTitles}
                  onStepClick={onStepClick}
                />
                
                {progress !== undefined && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      {progress}% completo
                    </p>
                  </div>
                )}
              </div>
            )}
          </header>
          
          <div className={cn(
            "bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700",
            "transition-all duration-200 hover:shadow-md"
          )}>
            {children}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};
