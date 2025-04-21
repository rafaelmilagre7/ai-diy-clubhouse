
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EtapasProgresso } from './EtapasProgresso';
import MemberLayout from '@/components/layout/MemberLayout';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  title: string;
  backUrl?: string;
  totalSteps?: number;
  progress?: number;
  hideProgress?: boolean;
}

export const OnboardingLayout = ({
  children,
  currentStep,
  title,
  backUrl,
  totalSteps = 8,
  progress,
  hideProgress = false
}: OnboardingLayoutProps) => {
  return (
    <MemberLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <header className="mb-10">
          {backUrl && (
            <Link 
              to={backUrl}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          )}
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
          
          {!hideProgress && (
            <div className="mb-6">
              <EtapasProgresso
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
              <p className="text-gray-500 mt-2">
                Etapa {currentStep} de {totalSteps}
              </p>
            </div>
          )}
        </header>
        
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          {children}
        </div>
      </div>
    </MemberLayout>
  );
};
