
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EtapasProgresso } from './EtapasProgresso';
import { theme } from '@/lib/theme';

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
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <header className="mb-10">
          {backUrl && (
            <Link 
              to={backUrl}
              className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          )}
          
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          
          {!hideProgress && (
            <div className="mb-6">
              <EtapasProgresso
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
              <p className="text-gray-400 mt-2">
                Etapa {currentStep} de {totalSteps}
              </p>
            </div>
          )}
        </header>
        
        <div className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
          {children}
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Seus dados são protegidos e utilizados apenas para personalizar sua experiência no VIVER DE IA Club.</p>
        </div>
      </div>
    </div>
  );
};
