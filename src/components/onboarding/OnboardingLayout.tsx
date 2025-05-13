
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { WizardStepProgress } from './WizardStepProgress';
import MemberLayout from '@/components/layout/MemberLayout';
import { cn } from '@/lib/utils';

export interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  title: string;
  description?: string;
  backUrl?: string;
  totalSteps?: number;
  stepTitles?: string[];
  onStepClick?: (step: number) => void;
  hideProgress?: boolean;
  isFormacao?: boolean; // Nova propriedade adicionada
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
  isFormacao = false // Valor padrão
}: OnboardingLayoutProps) => {
  return (
    <MemberLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-[#0F111A] dark:from-gray-900 dark:to-gray-800">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <header className="mb-8 space-y-4">
            {backUrl && (
              <Link 
                to={backUrl}
                className="inline-flex items-center text-neutral-400 hover:text-neutral-200 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Voltar
              </Link>
            )}
            
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
              {description && (
                <p className="text-neutral-400 text-base md:text-lg">{description}</p>
              )}
            </div>
            
            {!hideProgress && (
              <WizardStepProgress
                currentStep={currentStep}
                totalSteps={totalSteps}
                stepTitles={stepTitles}
                onStepClick={onStepClick}
              />
            )}
          </header>
          
          <div className={cn(
            "bg-[#151823] dark:bg-[#151823] rounded-xl p-6 md:p-8 shadow-md border border-neutral-700 dark:border-neutral-700",
            "transition-all duration-200 backdrop-blur-sm"
          )}>
            {children}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};
