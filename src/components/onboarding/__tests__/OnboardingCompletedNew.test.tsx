
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OnboardingCompletedNew from '../OnboardingCompletedNew';
import { AuthProvider } from '@/contexts/auth';

// Mock do usePostOnboarding
jest.mock('@/hooks/onboarding/usePostOnboarding', () => ({
  usePostOnboarding: () => ({
    isFirstAccess: true,
    hasCompletedTrail: true,
    goToImplementationTrail: jest.fn(),
    goToDashboard: jest.fn(),
    startWelcomeTour: jest.fn(),
    checkTrailStatus: jest.fn()
  })
}));

// Mock do canvas-confetti
jest.mock('canvas-confetti', () => jest.fn());

// Mock do Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('OnboardingCompletedNew', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve renderizar a página de conclusão com elementos principais', () => {
    renderWithProviders(<OnboardingCompletedNew />);
    
    expect(screen.getByText(/Parabéns!/i)).toBeInTheDocument();
    expect(screen.getByText(/onboarding foi concluído com sucesso/i)).toBeInTheDocument();
    expect(screen.getByText(/Perfil Completo/i)).toBeInTheDocument();
    expect(screen.getByText(/Objetivos Definidos/i)).toBeInTheDocument();
  });

  test('deve mostrar botão de trilha habilitado quando trilha está pronta', () => {
    renderWithProviders(<OnboardingCompletedNew />);
    
    const trailButton = screen.getByRole('button', { name: /Ver Trilha de Implementação/i });
    expect(trailButton).toBeInTheDocument();
    expect(trailButton).not.toBeDisabled();
  });

  test('deve mostrar botão de tour quando é primeiro acesso', () => {
    renderWithProviders(<OnboardingCompletedNew />);
    
    const tourButton = screen.getByRole('button', { name: /Fazer Tour do Dashboard/i });
    expect(tourButton).toBeInTheDocument();
  });

  test('deve mostrar próximos passos', () => {
    renderWithProviders(<OnboardingCompletedNew />);
    
    expect(screen.getByText(/Próximos Passos/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore sua trilha personalizada/i)).toBeInTheDocument();
    expect(screen.getByText(/Monitore seu progresso/i)).toBeInTheDocument();
    expect(screen.getByText(/Conecte-se com a comunidade/i)).toBeInTheDocument();
  });

  test('deve mostrar status da trilha', () => {
    renderWithProviders(<OnboardingCompletedNew />);
    
    expect(screen.getByText(/Trilha Pronta!/i)).toBeInTheDocument();
  });
});
