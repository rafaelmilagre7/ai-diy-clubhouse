
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { WizardStepProgress } from './WizardStepProgress';
import MemberLayout from '@/components/layout/MemberLayout';

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
  hideProgress = false
}: OnboardingLayoutProps) => {
  return (
    <MemberLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          {backUrl && (
            <Link 
              to={backUrl}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          )}
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {description && (
            <p className="text-gray-500 mb-6">{description}</p>
          )}
          
          {!hideProgress && (
            <div className="mt-6">
              <WizardStepProgress
                currentStep={currentStep}
                totalSteps={totalSteps}
                stepTitles={stepTitles}
                onStepClick={onStepClick}
              />
              <p className="text-gray-500 text-sm mt-2 text-center">
                Etapa {currentStep} de {totalSteps}
              </p>
            </div>
          )}
        </header>
        
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200">
          {children}
        </div>
      </div>
    </MemberLayout>
  );
};
