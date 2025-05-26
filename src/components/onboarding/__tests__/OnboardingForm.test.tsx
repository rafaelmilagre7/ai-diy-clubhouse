import React from 'react';
import { render, screen } from '@testing-library/react';
import { OnboardingForm } from '../OnboardingForm';
import { BrowserRouter } from 'react-router-dom';

// Mock de serviços
jest.mock('@/services/onboardingService', () => ({
  getUserOnboardingData: jest.fn().mockResolvedValue({ data: null }),
  saveOnboardingData: jest.fn().mockResolvedValue({ success: true }),
}));

// Wrapper para prover o roteamento
const FormWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('OnboardingForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renderiza o formulário corretamente', async () => {
    render(<OnboardingForm />, { wrapper: FormWrapper });
    
    // Verificar se os elementos principais estão presentes
    expect(await screen.findByText(/Informações Pessoais/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
  });
});
