
import React from 'react';
import { render } from '@testing-library/react';
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
    const { findByText, getByLabelText } = render(<OnboardingForm />, { wrapper: FormWrapper });
    
    // Verificar se os elementos principais estão presentes
    expect(await findByText(/Informações Pessoais/i)).toBeInTheDocument();
    expect(getByLabelText(/Nome Completo/i)).toBeInTheDocument();
    expect(getByLabelText(/E-mail/i)).toBeInTheDocument();
  });
});
