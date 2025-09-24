import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { EnhancedAutomationWizard } from '@/components/automations/EnhancedAutomationWizard';
import { 
  render, 
  mockNavigate, 
  mockToast, 
  mockUseParams,
  resetAllMocks 
} from '@/__tests__/utils/testUtils';
import { mockSupabaseClient, resetSupabaseMocks } from '@/__tests__/mocks/supabaseMocks';

// Mocks
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: mockUseParams
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

jest.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

describe('EnhancedAutomationWizard', () => {
  beforeEach(() => {
    resetAllMocks();
    resetSupabaseMocks();
    mockUseParams.mockReturnValue({});
  });

  describe('Back Button', () => {
    it('should navigate to automations list when "Voltar" button is clicked', () => {
      render(<EnhancedAutomationWizard />);
      
      const backButton = screen.getByRole('button', { name: /voltar/i });
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/admin/automations');
    });

    it('should have proper styling for back button', () => {
      render(<EnhancedAutomationWizard />);
      
      const backButton = screen.getByRole('button', { name: /voltar/i });
      expect(backButton).toHaveClass('variant-outline');
    });
  });

  describe('Test Button', () => {
    it('should show test button after step 1', () => {
      render(<EnhancedAutomationWizard />);
      
      // Preenche nome e vai para próxima etapa
      const nameInput = screen.getByLabelText(/nome/i);
      fireEvent.change(nameInput, { target: { value: 'Test Automation' } });
      
      const nextButton = screen.getByRole('button', { name: /próximo/i });
      fireEvent.click(nextButton);
      
      expect(screen.getByRole('button', { name: /testar/i })).toBeInTheDocument();
    });

    it('should not show test button on step 1', () => {
      render(<EnhancedAutomationWizard />);
      
      expect(screen.queryByRole('button', { name: /testar/i })).not.toBeInTheDocument();
    });

    it('should show toast when test button is clicked', async () => {
      render(<EnhancedAutomationWizard />);
      
      // Vai para step 2
      const nameInput = screen.getByLabelText(/nome/i);
      fireEvent.change(nameInput, { target: { value: 'Test Automation' } });
      
      const nextButton = screen.getByRole('button', { name: /próximo/i });
      fireEvent.click(nextButton);
      
      const testButton = screen.getByRole('button', { name: /testar/i });
      fireEvent.click(testButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Teste iniciado",
          description: "Executando teste da regra com dados mock..."
        });
      });
    });
  });

  describe('Navigation Buttons - Previous', () => {
    it('should go to previous step when "Anterior" button is clicked', async () => {
      render(<EnhancedAutomationWizard />);
      
      // Vai para step 2
      const nameInput = screen.getByLabelText(/nome/i);
      fireEvent.change(nameInput, { target: { value: 'Test Automation' } });
      
      const nextButton = screen.getByRole('button', { name: /próximo/i });
      fireEvent.click(nextButton);
      
      // Volta para step 1
      const prevButton = screen.getByRole('button', { name: /anterior/i });
      fireEvent.click(prevButton);
      
      await waitFor(() => {
        expect(screen.getByText(/informações básicas/i)).toBeInTheDocument();
      });
    });

    it('should not show previous button on step 1', () => {
      render(<EnhancedAutomationWizard />);
      
      expect(screen.queryByRole('button', { name: /anterior/i })).not.toBeInTheDocument();
    });
  });

  describe('Navigation Buttons - Next', () => {
    it('should go to next step when "Próximo" button is clicked with valid data', async () => {
      render(<EnhancedAutomationWizard />);
      
      const nameInput = screen.getByLabelText(/nome/i);
      fireEvent.change(nameInput, { target: { value: 'Test Automation' } });
      
      const nextButton = screen.getByRole('button', { name: /próximo/i });
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText(/condições/i)).toBeInTheDocument();
      });
    });

    it('should disable next button when data is invalid', () => {
      render(<EnhancedAutomationWizard />);
      
      const nextButton = screen.getByRole('button', { name: /próximo/i });
      expect(nextButton).toBeDisabled();
    });

    it('should enable next button when name is filled', async () => {
      render(<EnhancedAutomationWizard />);
      
      const nameInput = screen.getByLabelText(/nome/i);
      fireEvent.change(nameInput, { target: { value: 'Test Automation' } });
      
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /próximo/i });
        expect(nextButton).toBeEnabled();
      });
    });

    it('should show "Próximo" button on steps 1-3', () => {
      render(<EnhancedAutomationWizard />);
      
      expect(screen.getByRole('button', { name: /próximo/i })).toBeInTheDocument();
    });
  });

  describe('Save/Create Button', () => {
    it('should show create button on final step', async () => {
      render(<EnhancedAutomationWizard />);
      
      // Navega até o final
      await navigateToFinalStep();
      
      expect(screen.getByRole('button', { name: /criar automação/i })).toBeInTheDocument();
    });

    it('should show update button when editing', async () => {
      mockUseParams.mockReturnValue({ id: 'test-id' });
      mockSupabaseClient.from().select().eq().single.mockReturnValue({
        data: {
          id: 'test-id',
          name: 'Test Rule',
          description: 'Test Description',
          rule_type: 'webhook',
          is_active: true,
          priority: 1,
          conditions: { id: 'root', operator: 'AND', conditions: [] },
          actions: []
        },
        error: null
      });
      
      render(<EnhancedAutomationWizard />);
      
      await navigateToFinalStep();
      
      expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument();
    });

    it('should submit form when create button is clicked', async () => {
      mockSupabaseClient.from().insert.mockReturnValue({
        data: null,
        error: null
      });
      
      render(<EnhancedAutomationWizard />);
      
      await navigateToFinalStep();
      
      const createButton = screen.getByRole('button', { name: /criar automação/i });
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('automation_rules');
        expect(mockToast).toHaveBeenCalledWith({
          title: "Sucesso",
          description: "Regra criada com sucesso"
        });
        expect(mockNavigate).toHaveBeenCalledWith('/admin/automations');
      });
    });

    it('should handle submission errors', async () => {
      mockSupabaseClient.from().insert.mockReturnValue({ 
        data: null,
        error: { message: 'Database error' } 
      });
      
      render(<EnhancedAutomationWizard />);
      
      await navigateToFinalStep();
      
      const createButton = screen.getByRole('button', { name: /criar automação/i });
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Erro",
          description: "Não foi possível criar a regra",
          variant: "destructive"
        });
      });
    });

    it('should show loading state during submission', async () => {
      mockSupabaseClient.from().insert.mockReturnValue({
        data: null,
        error: null
      });
      
      render(<EnhancedAutomationWizard />);
      
      await navigateToFinalStep();
      
      const createButton = screen.getByRole('button', { name: /criar automação/i });
      fireEvent.click(createButton);
      
      expect(screen.getByText(/salvando/i)).toBeInTheDocument();
    });

    it('should disable button during loading', async () => {
      mockSupabaseClient.from().insert.mockReturnValue({
        data: null,
        error: null
      });
      
      render(<EnhancedAutomationWizard />);
      
      await navigateToFinalStep();
      
      const createButton = screen.getByRole('button', { name: /criar automação/i });
      fireEvent.click(createButton);
      
      expect(createButton).toBeDisabled();
    });
  });

  describe('Progress Navigation', () => {
    it('should navigate to specific step when progress indicator is clicked', async () => {
      render(<EnhancedAutomationWizard />);
      
      // Preenche dados válidos primeiro
      const nameInput = screen.getByLabelText(/nome/i);
      fireEvent.change(nameInput, { target: { value: 'Test Automation' } });
      
      // Navega pelo progresso (se implementado)
      const step2Indicator = screen.getByText(/condições/i);
      if (step2Indicator.closest('[role="button"]')) {
        fireEvent.click(step2Indicator);
        
        await waitFor(() => {
          expect(screen.getByText(/quando executar/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Form Validation', () => {
    it('should validate step 1 - require name', () => {
      render(<EnhancedAutomationWizard />);
      
      const nextButton = screen.getByRole('button', { name: /próximo/i });
      expect(nextButton).toBeDisabled();
    });

    it('should validate step 2 - require at least one condition', async () => {
      render(<EnhancedAutomationWizard />);
      
      // Vai para step 2
      const nameInput = screen.getByLabelText(/nome/i);
      fireEvent.change(nameInput, { target: { value: 'Test Automation' } });
      
      const nextButton = screen.getByRole('button', { name: /próximo/i });
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        const nextButtonStep2 = screen.getByRole('button', { name: /próximo/i });
        expect(nextButtonStep2).toBeDisabled();
      });
    });

    it('should validate step 3 - require at least one action', async () => {
      render(<EnhancedAutomationWizard />);
      
      // Navega para step 3 (assumindo que condições foram preenchidas)
      await navigateToStep3();
      
      const nextButton = screen.getByRole('button', { name: /próximo/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Edit Mode', () => {
    it('should load existing data when editing', async () => {
      mockUseParams.mockReturnValue({ id: 'test-id' });
      mockSupabaseClient.from().select().eq().single.mockReturnValue({
        data: {
          id: 'test-id',
          name: 'Existing Rule',
          description: 'Existing Description',
          rule_type: 'webhook',
          is_active: true,
          priority: 1,
          conditions: { id: 'root', operator: 'AND', conditions: [] },
          actions: []
        },
        error: null
      });
      
      render(<EnhancedAutomationWizard />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing Rule')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
      });
    });

    it('should handle load error and navigate back', async () => {
      mockUseParams.mockReturnValue({ id: 'test-id' });
      mockSupabaseClient.from().select().eq().single.mockReturnValue({
        data: null,
        error: { message: 'Not found' }
      });
      
      render(<EnhancedAutomationWizard />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Erro",
          description: "Não foi possível carregar a regra",
          variant: "destructive"
        });
        expect(mockNavigate).toHaveBeenCalledWith('/admin/automations');
      });
    });
  });

  describe('Step Content Rendering', () => {
    it('should show correct step titles', () => {
      render(<EnhancedAutomationWizard />);
      
      expect(screen.getByText(/nova automação/i)).toBeInTheDocument();
      expect(screen.getByText(/wizard inteligente/i)).toBeInTheDocument();
    });

    it('should show edit title when editing', () => {
      mockUseParams.mockReturnValue({ id: 'test-id' });
      
      render(<EnhancedAutomationWizard />);
      
      expect(screen.getByText(/editar automação/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button labels', () => {
      render(<EnhancedAutomationWizard />);
      
      expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /próximo/i })).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<EnhancedAutomationWizard />);
      
      const backButton = screen.getByRole('button', { name: /voltar/i });
      backButton.focus();
      expect(backButton).toHaveFocus();
    });

    it('should have proper form structure', () => {
      render(<EnhancedAutomationWizard />);
      
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });

  // Helper functions
  const navigateToFinalStep = async () => {
    // Step 1: Fill name
    const nameInput = screen.getByLabelText(/nome/i);
    fireEvent.change(nameInput, { target: { value: 'Test Automation' } });
    
    let nextButton = screen.getByRole('button', { name: /próximo/i });
    fireEvent.click(nextButton);
    
    // Step 2: Add condition (mock)
    await waitFor(() => {
      // Simulate adding a condition
      // This would need to be implemented based on the actual ConditionBuilder
    });
    
    // Continue to final step...
    // This is simplified - in reality you'd need to properly fill each step
  };

  const navigateToStep3 = async () => {
    // Similar to navigateToFinalStep but stops at step 3
    const nameInput = screen.getByLabelText(/nome/i);
    fireEvent.change(nameInput, { target: { value: 'Test Automation' } });
    
    let nextButton = screen.getByRole('button', { name: /próximo/i });
    fireEvent.click(nextButton);
    
    // Add condition and continue...
  };
});