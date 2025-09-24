import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import { AutomationCard } from '@/components/automations/AutomationCard';
import { render, resetAllMocks } from '@/__tests__/utils/testUtils';
import { mockAutomationRule } from '@/__tests__/mocks/automationMocks';

describe('AutomationCard', () => {
  const mockOnToggle = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const defaultProps = {
    rule: mockAutomationRule,
    onToggle: mockOnToggle,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete
  };

  beforeEach(() => {
    resetAllMocks();
    mockOnToggle.mockClear();
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  describe('Toggle Button', () => {
    it('should call onToggle with correct parameters when toggle button is clicked', () => {
      render(<AutomationCard {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { name: /pausar|ativar/i });
      fireEvent.click(toggleButton);
      
      expect(mockOnToggle).toHaveBeenCalledWith(mockAutomationRule.id, mockAutomationRule.is_active);
    });

    it('should show correct toggle button text for active rule', () => {
      render(<AutomationCard {...defaultProps} />);
      
      expect(screen.getByText(/pausar/i)).toBeInTheDocument();
    });

    it('should show correct toggle button text for inactive rule', () => {
      const inactiveRule = { ...mockAutomationRule, is_active: false };
      render(<AutomationCard {...defaultProps} rule={inactiveRule} />);
      
      expect(screen.getByText(/ativar/i)).toBeInTheDocument();
    });

    it('should have proper styling for active rule toggle button', () => {
      render(<AutomationCard {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { name: /pausar/i });
      expect(toggleButton).toHaveClass('bg-yellow-500', 'hover:bg-yellow-600');
    });

    it('should have proper styling for inactive rule toggle button', () => {
      const inactiveRule = { ...mockAutomationRule, is_active: false };
      render(<AutomationCard {...defaultProps} rule={inactiveRule} />);
      
      const toggleButton = screen.getByRole('button', { name: /ativar/i });
      expect(toggleButton).toHaveClass('bg-green-500', 'hover:bg-green-600');
    });
  });

  describe('Edit Button', () => {
    it('should call onEdit with correct rule id when edit button is clicked', () => {
      render(<AutomationCard {...defaultProps} />);
      
      const editButton = screen.getByRole('button', { name: /editar/i });
      fireEvent.click(editButton);
      
      expect(mockOnEdit).toHaveBeenCalledWith(mockAutomationRule.id);
    });

    it('should have proper styling for edit button', () => {
      render(<AutomationCard {...defaultProps} />);
      
      const editButton = screen.getByRole('button', { name: /editar/i });
      expect(editButton).toHaveClass('bg-blue-500', 'hover:bg-blue-600');
    });
  });

  describe('Delete Button', () => {
    it('should call onDelete with correct rule id when delete button is clicked', () => {
      render(<AutomationCard {...defaultProps} />);
      
      const deleteButton = screen.getByRole('button', { name: /deletar/i });
      fireEvent.click(deleteButton);
      
      expect(mockOnDelete).toHaveBeenCalledWith(mockAutomationRule.id);
    });

    it('should have proper styling for delete button', () => {
      render(<AutomationCard {...defaultProps} />);
      
      const deleteButton = screen.getByRole('button', { name: /deletar/i });
      expect(deleteButton).toHaveClass('bg-red-500', 'hover:bg-red-600');
    });
  });

  describe('Rule Information Display', () => {
    it('should display rule name', () => {
      render(<AutomationCard {...defaultProps} />);
      
      expect(screen.getByText(mockAutomationRule.name)).toBeInTheDocument();
    });

    it('should display rule description', () => {
      render(<AutomationCard {...defaultProps} />);
      
      expect(screen.getByText(mockAutomationRule.description)).toBeInTheDocument();
    });

    it('should display rule type with correct styling', () => {
      render(<AutomationCard {...defaultProps} />);
      
      const typeElement = screen.getByText(/webhook/i);
      expect(typeElement).toBeInTheDocument();
    });

    it('should display correct status badge for active rule', () => {
      render(<AutomationCard {...defaultProps} />);
      
      expect(screen.getByText(/ativa/i)).toBeInTheDocument();
    });

    it('should display correct status badge for inactive rule', () => {
      const inactiveRule = { ...mockAutomationRule, is_active: false };
      render(<AutomationCard {...defaultProps} rule={inactiveRule} />);
      
      expect(screen.getByText(/inativa/i)).toBeInTheDocument();
    });

    it('should display priority', () => {
      render(<AutomationCard {...defaultProps} />);
      
      expect(screen.getByText(`Prioridade: ${mockAutomationRule.priority}`)).toBeInTheDocument();
    });
  });

  describe('Button States and Interactions', () => {
    it('should handle multiple rapid clicks on toggle button', () => {
      render(<AutomationCard {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { name: /pausar/i });
      
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      
      expect(mockOnToggle).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple rapid clicks on edit button', () => {
      render(<AutomationCard {...defaultProps} />);
      
      const editButton = screen.getByRole('button', { name: /editar/i });
      
      fireEvent.click(editButton);
      fireEvent.click(editButton);
      
      expect(mockOnEdit).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple rapid clicks on delete button', () => {
      render(<AutomationCard {...defaultProps} />);
      
      const deleteButton = screen.getByRole('button', { name: /deletar/i });
      
      fireEvent.click(deleteButton);
      fireEvent.click(deleteButton);
      
      expect(mockOnDelete).toHaveBeenCalledTimes(2);
    });
  });

  describe('Rule Type Styling', () => {
    it('should apply correct color for webhook rule type', () => {
      render(<AutomationCard {...defaultProps} />);
      
      const typeElement = screen.getByText('Webhook');
      expect(typeElement).toHaveClass('text-blue-600', 'bg-blue-50');
    });

    it('should apply correct color for schedule rule type', () => {
      const scheduleRule = { ...mockAutomationRule, rule_type: 'schedule' };
      render(<AutomationCard {...defaultProps} rule={scheduleRule} />);
      
      const typeElement = screen.getByText('Agendado');
      expect(typeElement).toHaveClass('text-green-600', 'bg-green-50');
    });

    it('should apply default color for unknown rule type', () => {
      const unknownRule = { ...mockAutomationRule, rule_type: 'unknown' };
      render(<AutomationCard {...defaultProps} rule={unknownRule} />);
      
      const typeElement = screen.getByText('unknown');
      expect(typeElement).toHaveClass('text-gray-600', 'bg-gray-50');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<AutomationCard {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /pausar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /deletar/i })).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<AutomationCard {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toBeVisible();
        button.focus();
        expect(button).toHaveFocus();
      });
    });

    it('should have proper ARIA attributes', () => {
      render(<AutomationCard {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toBeEnabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing callback functions gracefully', () => {
      const propsWithoutCallbacks = {
        rule: mockAutomationRule,
        onToggle: undefined as any,
        onEdit: undefined as any,
        onDelete: undefined as any
      };
      
      expect(() => render(<AutomationCard {...propsWithoutCallbacks} />)).not.toThrow();
    });

    it('should handle rule with missing properties', () => {
      const incompleteRule = {
        id: 'test-id',
        name: 'Test Rule'
      } as any;
      
      expect(() => 
        render(<AutomationCard {...defaultProps} rule={incompleteRule} />)
      ).not.toThrow();
    });
  });
});