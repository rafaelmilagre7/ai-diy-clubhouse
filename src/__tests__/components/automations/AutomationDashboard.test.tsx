import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import { AutomationDashboard } from '@/components/automations/AutomationDashboard';
import { 
  render, 
  mockUseAutomationRules, 
  mockUseAutomationLogStats,
  resetAllMocks 
} from '@/__tests__/utils/testUtils';
import { mockAutomationRules, mockLogStats } from '@/__tests__/mocks/automationMocks';

// Mock dos hooks
jest.mock('@/hooks/useAutomationRules', () => ({
  useAutomationRules: mockUseAutomationRules
}));

jest.mock('@/hooks/useAutomationLogs', () => ({
  useAutomationLogStats: mockUseAutomationLogStats
}));

describe('AutomationDashboard', () => {
  const mockOnCreateRule = jest.fn();
  const mockOnViewLogs = jest.fn();
  const mockOnViewRules = jest.fn();

  const defaultProps = {
    onCreateRule: mockOnCreateRule,
    onViewLogs: mockOnViewLogs,
    onViewRules: mockOnViewRules
  };

  beforeEach(() => {
    resetAllMocks();
    mockOnCreateRule.mockClear();
    mockOnViewLogs.mockClear();
    mockOnViewRules.mockClear();
    
    mockUseAutomationRules.mockReturnValue({
      data: mockAutomationRules
    });
    
    mockUseAutomationLogStats.mockReturnValue({
      data: mockLogStats
    });
  });

  describe('Header Buttons', () => {
    it('should call onViewLogs when "Logs" button is clicked', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      const logsButton = screen.getByRole('button', { name: /logs/i });
      fireEvent.click(logsButton);
      
      expect(mockOnViewLogs).toHaveBeenCalledTimes(1);
    });

    it('should call onCreateRule when "Nova Automação" button is clicked', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      const newAutomationButton = screen.getByRole('button', { name: /nova automação/i });
      fireEvent.click(newAutomationButton);
      
      expect(mockOnCreateRule).toHaveBeenCalledTimes(1);
    });

    it('should have proper styling for header buttons', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      const logsButton = screen.getByRole('button', { name: /logs/i });
      const newAutomationButton = screen.getByRole('button', { name: /nova automação/i });
      
      expect(logsButton).toHaveClass('variant-outline');
      expect(newAutomationButton).toHaveClass('bg-gradient-to-r', 'from-primary', 'to-primary/80');
    });
  });

  describe('Quick Actions Buttons', () => {
    it('should call onCreateRule when "Criar Nova Regra" quick action is clicked', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      const createRuleButton = screen.getByRole('button', { name: /criar nova regra/i });
      fireEvent.click(createRuleButton);
      
      expect(mockOnCreateRule).toHaveBeenCalledTimes(1);
    });

    it('should call onViewRules when "Gerenciar Regras" quick action is clicked', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      const manageRulesButton = screen.getByRole('button', { name: /gerenciar regras/i });
      fireEvent.click(manageRulesButton);
      
      expect(mockOnViewRules).toHaveBeenCalledTimes(1);
    });

    it('should call onViewLogs when "Monitorar Execuções" quick action is clicked', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      const monitorButton = screen.getByRole('button', { name: /monitorar execuções/i });
      fireEvent.click(monitorButton);
      
      expect(mockOnViewLogs).toHaveBeenCalledTimes(1);
    });

    it('should have proper structure for quick action buttons', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      const quickActionButtons = screen.getAllByRole('button').filter(btn => 
        btn.className.includes('justify-start') && btn.className.includes('h-auto')
      );
      
      expect(quickActionButtons).toHaveLength(3);
      
      quickActionButtons.forEach(button => {
        expect(button).toHaveClass('variant-outline');
        expect(button).toHaveClass('w-full');
        expect(button).toHaveClass('justify-start');
      });
    });
  });

  describe('System Status Section', () => {
    it('should call onViewLogs when "Investigar" button is clicked for failures', () => {
      // Mock com falhas para mostrar o botão investigar
      mockUseAutomationLogStats.mockReturnValue({
        data: { ...mockLogStats, failed: 5 }
      });
      
      render(<AutomationDashboard {...defaultProps} />);
      
      const investigateButton = screen.getByRole('button', { name: /investigar/i });
      fireEvent.click(investigateButton);
      
      expect(mockOnViewLogs).toHaveBeenCalledTimes(1);
    });

    it('should not show "Investigar" button when there are no failures', () => {
      mockUseAutomationLogStats.mockReturnValue({
        data: { ...mockLogStats, failed: 0 }
      });
      
      render(<AutomationDashboard {...defaultProps} />);
      
      const investigateButton = screen.queryByRole('button', { name: /investigar/i });
      expect(investigateButton).not.toBeInTheDocument();
    });

    it('should show failure alert when there are failed executions', () => {
      mockUseAutomationLogStats.mockReturnValue({
        data: { ...mockLogStats, failed: 5 }
      });
      
      render(<AutomationDashboard {...defaultProps} />);
      
      expect(screen.getByText(/5 falhas recentes/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /investigar/i })).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should display correct automation statistics', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      // Total rules
      expect(screen.getByText('2')).toBeInTheDocument();
      
      // Active and inactive counts
      expect(screen.getByText('+1 ativas • 1 inativas')).toBeInTheDocument();
      
      // Success rate
      const successRate = ((mockLogStats.success / mockLogStats.total) * 100).toFixed(1);
      expect(screen.getByText(`${successRate}%`)).toBeInTheDocument();
      
      // Total executions
      expect(screen.getByText(mockLogStats.total.toString())).toBeInTheDocument();
    });

    it('should handle zero statistics gracefully', () => {
      mockUseAutomationRules.mockReturnValue({ data: [] });
      mockUseAutomationLogStats.mockReturnValue({ data: null });
      
      render(<AutomationDashboard {...defaultProps} />);
      
      expect(screen.getByText('0')).toBeInTheDocument(); // Total rules
      expect(screen.getByText('0.0%')).toBeInTheDocument(); // Success rate
    });

    it('should calculate webhook and scheduled rule counts correctly', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      // Webhook rules count
      expect(screen.getByText('2 regras')).toBeInTheDocument(); // All rules are webhook type
      
      // Scheduled rules count (should be 0 in mock data)
      const scheduledElements = screen.getAllByText('0 regras');
      expect(scheduledElements.length).toBeGreaterThan(0);
    });
  });

  describe('Button States and Interactions', () => {
    it('should handle multiple clicks on the same button', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      const createButton = screen.getByRole('button', { name: /nova automação/i });
      
      fireEvent.click(createButton);
      fireEvent.click(createButton);
      fireEvent.click(createButton);
      
      expect(mockOnCreateRule).toHaveBeenCalledTimes(3);
    });

    it('should handle clicks on different buttons in sequence', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      const logsButton = screen.getByRole('button', { name: /logs/i });
      const createButton = screen.getByRole('button', { name: /nova automação/i });
      
      fireEvent.click(logsButton);
      fireEvent.click(createButton);
      
      expect(mockOnViewLogs).toHaveBeenCalledTimes(1);
      expect(mockOnCreateRule).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Design', () => {
    it('should render all metric cards', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      expect(screen.getByText(/total de regras/i)).toBeInTheDocument();
      expect(screen.getByText(/taxa de sucesso/i)).toBeInTheDocument();
      expect(screen.getByText(/execuções hoje/i)).toBeInTheDocument();
      expect(screen.getByText(/tempo médio/i)).toBeInTheDocument();
    });

    it('should render quick actions and status overview sections', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      expect(screen.getByText(/ações rápidas/i)).toBeInTheDocument();
      expect(screen.getByText(/visão geral do sistema/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button labels and descriptions', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /logs/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /nova automação/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /criar nova regra/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /gerenciar regras/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /monitorar execuções/i })).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toBeVisible();
        button.focus();
        expect(button).toHaveFocus();
      });
    });

    it('should have descriptive text for each quick action', () => {
      render(<AutomationDashboard {...defaultProps} />);
      
      expect(screen.getByText(/use templates ou crie do zero/i)).toBeInTheDocument();
      expect(screen.getByText(/editar e organizar automações/i)).toBeInTheDocument();
      expect(screen.getByText(/ver logs e diagnosticar problemas/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing callback functions gracefully', () => {
      const propsWithoutCallbacks = {
        onCreateRule: undefined as any,
        onViewLogs: undefined as any,
        onViewRules: undefined as any
      };
      
      expect(() => render(<AutomationDashboard {...propsWithoutCallbacks} />)).not.toThrow();
    });

    it('should handle undefined data from hooks', () => {
      mockUseAutomationRules.mockReturnValue({ data: undefined });
      mockUseAutomationLogStats.mockReturnValue({ data: undefined });
      
      expect(() => render(<AutomationDashboard {...defaultProps} />)).not.toThrow();
      
      // Should show default values
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });
  });
});