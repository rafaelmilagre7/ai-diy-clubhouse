
import React from 'react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout isolado para o onboarding
 * Não interfere com o layout principal da plataforma
 */
export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simples para onboarding */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Viver de IA
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              Configuração inicial
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer simples */}
      <footer className="mt-auto py-6 text-center text-sm text-gray-500">
        <p>© 2024 Viver de IA. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};
