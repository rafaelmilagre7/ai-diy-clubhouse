
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EtapasProgresso } from './EtapasProgresso';

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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          {backUrl && (
            <Link 
              to={backUrl}
              className="inline-flex items-center text-gray-400 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          )}
          
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          
          {!hideProgress && (
            <EtapasProgresso
              currentStep={currentStep}
              totalSteps={totalSteps}
            />
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
};
