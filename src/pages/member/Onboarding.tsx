
import React from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useOnboardingLogic } from '@/hooks/onboarding/useOnboardingLogic';

/**
 * Página de Onboarding - FASE 1
 * Implementação super segura que não afeta usuários existentes
 */
const Onboarding: React.FC = () => {
  const { isLoading } = useOnboardingLogic();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <OnboardingLayout>
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Bem-vindo à Plataforma!
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Onboarding - Fase 1 (Teste)
          </h2>
          
          <p className="text-gray-600 mb-6">
            Esta é a implementação inicial super segura do onboarding.
            Não afeta usuários existentes e pode ser acessada manualmente.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Status Atual:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Página criada de forma isolada</li>
              <li>✅ Rota adicionada sem afetar existentes</li>
              <li>✅ Zero impacto em usuários ativos</li>
              <li>⏳ Próximo: Sistema de bypass inteligente</li>
            </ul>
          </div>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-viverblue text-white px-6 py-2 rounded-lg hover:bg-viverblue/90 transition-colors"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default Onboarding;
