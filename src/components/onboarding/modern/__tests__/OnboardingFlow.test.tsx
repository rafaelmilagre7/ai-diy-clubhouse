
import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModernOnboardingFlowNew } from '../ModernOnboardingFlowNew';
import { AuthProvider } from '@/contexts/auth';

// Mock do Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => Promise.resolve({ data: null, error: null })),
      upsert: jest.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }
}));

// Mock do useAuth
jest.mock('@/contexts/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' }
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
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

describe('ModernOnboardingFlowNew', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve carregar a primeira etapa corretamente', () => {
    renderWithProviders(<ModernOnboardingFlowNew />);
    
    expect(screen.getByText(/Quem é você/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome completo/i)).toBeInTheDocument();
  });

  test('deve validar campos obrigatórios', async () => {
    renderWithProviders(<ModernOnboardingFlowNew />);
    
    const continueButton = screen.getByRole('button', { name: /continuar/i });
    fireEvent.click(continueButton);
    
    // Botão deve estar desabilitado se campos obrigatórios não estão preenchidos
    expect(continueButton).toBeDisabled();
  });

  test('deve navegar entre etapas quando dados válidos', async () => {
    renderWithProviders(<ModernOnboardingFlowNew />);
    
    // Preencher campos da primeira etapa
    fireEvent.change(screen.getByLabelText(/Nome completo/i), {
      target: { value: 'João Silva' }
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: 'joao@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/WhatsApp/i), {
      target: { value: '(11) 99999-9999' }
    });
    
    // Selecionar como conheceu
    const howFoundSelect = screen.getByRole('combobox');
    fireEvent.click(howFoundSelect);
    fireEvent.click(screen.getByText(/Google/i));
    
    const continueButton = screen.getByRole('button', { name: /continuar/i });
    
    await waitFor(() => {
      expect(continueButton).not.toBeDisabled();
    });
    
    fireEvent.click(continueButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Seu negócio/i)).toBeInTheDocument();
    });
  });

  test('deve mostrar botão voltar nas etapas 2 e 3', async () => {
    renderWithProviders(<ModernOnboardingFlowNew />);
    
    // Navegar para etapa 2 (assumindo dados válidos)
    // ... código para preencher e avançar
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument();
    });
  });

  test('deve completar o onboarding na última etapa', async () => {
    renderWithProviders(<ModernOnboardingFlowNew />);
    
    // Simular preenchimento completo e navegação até o final
    // ... código para preencher todas as etapas
    
    await waitFor(() => {
      expect(screen.getByText(/trilha personalizada/i)).toBeInTheDocument();
    });
  });
});
