import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { ConditionBuilder } from '@/components/automations/ConditionBuilder';
import { render, resetAllMocks, createMockEvent } from '@/__tests__/utils/testUtils';
import { mockAvailableFields } from '@/__tests__/mocks/automationMocks';

describe('ConditionBuilder', () => {
  const mockOnChange = jest.fn();
  
  const mockConditions = {
    id: 'root',
    operator: 'AND' as const,
    conditions: [
      {
        id: 'condition1',
        field: 'event_type',
        operator: 'equals',
        value: 'purchase_completed',
        type: 'string'
      }
    ]
  };

  const emptyConditions = {
    id: 'root',
    operator: 'AND' as const,
    conditions: []
  };

  const defaultProps = {
    conditions: mockConditions,
    onChange: mockOnChange,
    availableFields: mockAvailableFields
  };

  beforeEach(() => {
    resetAllMocks();
    mockOnChange.mockClear();
  });

  describe('Add Condition Button', () => {
    it('should add new condition when "Adicionar primeira condição" button is clicked', async () => {
      render(<ConditionBuilder {...defaultProps} conditions={emptyConditions} />);
      
      const addFirstConditionButton = screen.getByRole('button', { name: /adicionar primeira condição/i });
      fireEvent.click(addFirstConditionButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            conditions: expect.arrayContaining([
              expect.objectContaining({
                field: '',
                operator: 'equals',
                value: '',
                type: 'string'
              })
            ])
          })
        );
      });
    });

    it('should add new condition when "Condição" button is clicked', async () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const addConditionButton = screen.getByRole('button', { name: /condição/i });
      fireEvent.click(addConditionButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            conditions: expect.arrayContaining([
              mockConditions.conditions[0],
              expect.objectContaining({
                field: '',
                operator: 'equals',
                value: '',
                type: 'string'
              })
            ])
          })
        );
      });
    });

    it('should add new group when "Grupo" button is clicked', async () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const addGroupButton = screen.getByRole('button', { name: /grupo/i });
      fireEvent.click(addGroupButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            conditions: expect.arrayContaining([
              mockConditions.conditions[0],
              expect.objectContaining({
                operator: 'AND',
                conditions: [],
                expanded: true
              })
            ])
          })
        );
      });
    });
  });

  describe('Remove Condition Button', () => {
    it('should remove condition when X button is clicked', async () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const removeButton = screen.getByRole('button', { name: '' });
      fireEvent.click(removeButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            conditions: []
          })
        );
      });
    });

    it('should handle removing non-existent condition gracefully', async () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const removeButton = screen.getByRole('button', { name: '' });
      
      // Simula remoção múltipla
      fireEvent.click(removeButton);
      fireEvent.click(removeButton);
      
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Condition Field Selection', () => {
    it('should update condition field when field is selected', async () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const fieldSelect = screen.getByDisplayValue('event_type');
      fireEvent.click(fieldSelect);
      
      const emailOption = screen.getByText(/email do cliente/i);
      fireEvent.click(emailOption);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            conditions: expect.arrayContaining([
              expect.objectContaining({
                field: 'payload.event.customer.email',
                type: 'string',
                operator: 'equals',
                value: ''
              })
            ])
          })
        );
      });
    });

    it('should reset operator and value when field type changes', async () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const fieldSelect = screen.getByDisplayValue('event_type');
      fireEvent.click(fieldSelect);
      
      const valueField = screen.getByText(/valor da compra/i);
      fireEvent.click(valueField);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            conditions: expect.arrayContaining([
              expect.objectContaining({
                field: 'payload.event.value',
                type: 'number',
                operator: 'equals',
                value: ''
              })
            ])
          })
        );
      });
    });

    it('should display available fields correctly', () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const fieldSelect = screen.getByDisplayValue('event_type');
      fireEvent.click(fieldSelect);
      
      expect(screen.getByText(/tipo do evento/i)).toBeInTheDocument();
      expect(screen.getByText(/nome do produto/i)).toBeInTheDocument();
      expect(screen.getByText(/email do cliente/i)).toBeInTheDocument();
      expect(screen.getByText(/valor da compra/i)).toBeInTheDocument();
    });
  });

  describe('Operator Selection', () => {
    it('should update operator when new operator is selected', async () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const operatorSelect = screen.getByDisplayValue(/igual a/i);
      fireEvent.click(operatorSelect);
      
      const containsOption = screen.getByText(/contém/i);
      fireEvent.click(containsOption);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            conditions: expect.arrayContaining([
              expect.objectContaining({
                operator: 'contains'
              })
            ])
          })
        );
      });
    });

    it('should show correct operators for string fields', () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const operatorSelect = screen.getByDisplayValue(/igual a/i);
      fireEvent.click(operatorSelect);
      
      expect(screen.getByText(/igual a/i)).toBeInTheDocument();
      expect(screen.getByText(/contém/i)).toBeInTheDocument();
      expect(screen.getByText(/começa com/i)).toBeInTheDocument();
      expect(screen.getByText(/termina com/i)).toBeInTheDocument();
    });

    it('should show correct operators for number fields', async () => {
      const numberCondition = {
        id: 'root',
        operator: 'AND' as const,
        conditions: [
          {
            id: 'condition1',
            field: 'payload.event.value',
            operator: 'equals',
            value: 100,
            type: 'number'
          }
        ]
      };
      
      render(<ConditionBuilder {...defaultProps} conditions={numberCondition} />);
      
      const operatorSelect = screen.getByDisplayValue(/igual a/i);
      fireEvent.click(operatorSelect);
      
      expect(screen.getByText(/maior que/i)).toBeInTheDocument();
      expect(screen.getByText(/menor que/i)).toBeInTheDocument();
      expect(screen.getByText(/maior ou igual a/i)).toBeInTheDocument();
    });
  });

  describe('Value Input', () => {
    it('should update string value when input changes', async () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const valueInput = screen.getByPlaceholderText(/digite o valor/i);
      fireEvent.change(valueInput, createMockEvent('new_value'));
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            conditions: expect.arrayContaining([
              expect.objectContaining({
                value: 'new_value'
              })
            ])
          })
        );
      });
    });

    it('should handle number input correctly', async () => {
      const numberCondition = {
        id: 'root',
        operator: 'AND' as const,
        conditions: [
          {
            id: 'condition1',
            field: 'payload.event.value',
            operator: 'equals',
            value: 100,
            type: 'number'
          }
        ]
      };
      
      render(<ConditionBuilder {...defaultProps} conditions={numberCondition} />);
      
      const valueInput = screen.getByDisplayValue('100');
      fireEvent.change(valueInput, createMockEvent('200'));
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            conditions: expect.arrayContaining([
              expect.objectContaining({
                value: 200
              })
            ])
          })
        );
      });
    });

    it('should handle boolean select correctly', async () => {
      const booleanCondition = {
        id: 'root',
        operator: 'AND' as const,
        conditions: [
          {
            id: 'condition1',
            field: 'is_active',
            operator: 'equals',
            value: true,
            type: 'boolean'
          }
        ]
      };
      
      render(<ConditionBuilder {...defaultProps} conditions={booleanCondition} />);
      
      const booleanSelect = screen.getByDisplayValue(/verdadeiro/i);
      fireEvent.click(booleanSelect);
      
      const falseOption = screen.getByText(/falso/i);
      fireEvent.click(falseOption);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            conditions: expect.arrayContaining([
              expect.objectContaining({
                value: false
              })
            ])
          })
        );
      });
    });

    it('should disable value input for empty/not_empty operators', () => {
      const emptyCondition = {
        id: 'root',
        operator: 'AND' as const,
        conditions: [
          {
            id: 'condition1',
            field: 'event_type',
            operator: 'empty',
            value: '',
            type: 'string'
          }
        ]
      };
      
      render(<ConditionBuilder {...defaultProps} conditions={emptyCondition} />);
      
      const valueInput = screen.getByPlaceholderText(/digite o valor/i);
      expect(valueInput).toBeDisabled();
    });
  });

  describe('Group Operations', () => {
    it('should update main group operator when AND/OR buttons are clicked', async () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const orButton = screen.getByRole('button', { name: /ou/i });
      fireEvent.click(orButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            operator: 'OR'
          })
        );
      });
    });

    it('should show correct active state for operator buttons', () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const andButton = screen.getByRole('button', { name: /e/i });
      expect(andButton).toHaveClass('variant-default');
    });

    it('should toggle group expansion when chevron button is clicked', async () => {
      const groupCondition = {
        id: 'root',
        operator: 'AND' as const,
        conditions: [
          {
            id: 'group1',
            operator: 'OR' as const,
            conditions: [],
            expanded: true
          }
        ]
      };
      
      render(<ConditionBuilder {...defaultProps} conditions={groupCondition} />);
      
      // Procura pelo botão de expansão do grupo
      const chevronButton = document.querySelector('[class*="h-6 w-6 p-0"]');
      if (chevronButton) {
        fireEvent.click(chevronButton);
        
        await waitFor(() => {
          expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({
              conditions: expect.arrayContaining([
                expect.objectContaining({
                  expanded: false
                })
              ])
            })
          );
        });
      }
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no conditions exist', () => {
      render(<ConditionBuilder {...defaultProps} conditions={emptyConditions} />);
      
      expect(screen.getByText(/nenhuma condição configurada/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /adicionar primeira condição/i })).toBeInTheDocument();
    });

    it('should hide empty state when conditions exist', () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      expect(screen.queryByText(/nenhuma condição configurada/i)).not.toBeInTheDocument();
    });
  });

  describe('Nested Groups', () => {
    it('should handle nested groups correctly', () => {
      const nestedCondition = {
        id: 'root',
        operator: 'AND' as const,
        conditions: [
          {
            id: 'group1',
            operator: 'OR' as const,
            conditions: [
              {
                id: 'condition1',
                field: 'event_type',
                operator: 'equals',
                value: 'test',
                type: 'string'
              }
            ],
            expanded: true
          }
        ]
      };
      
      render(<ConditionBuilder {...defaultProps} conditions={nestedCondition} />);
      
      expect(screen.getByText(/grupo or/i)).toBeInTheDocument();
    });

    it('should add conditions to nested groups', async () => {
      const nestedCondition = {
        id: 'root',
        operator: 'AND' as const,
        conditions: [
          {
            id: 'group1',
            operator: 'OR' as const,
            conditions: [],
            expanded: true
          }
        ]
      };
      
      render(<ConditionBuilder {...defaultProps} conditions={nestedCondition} />);
      
      // Deve ter botões para adicionar condições no grupo aninhado
      const addButtons = screen.getAllByRole('button', { name: /condição/i });
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form elements', () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      expect(screen.getByText(/campo/i)).toBeInTheDocument();
      expect(screen.getByText(/operador/i)).toBeInTheDocument();
      expect(screen.getByText(/valor/i)).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const fieldSelect = screen.getByDisplayValue('event_type');
      fieldSelect.focus();
      expect(fieldSelect).toHaveFocus();
    });

    it('should have proper button accessibility', () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeEnabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing onChange callback gracefully', () => {
      const propsWithoutCallback = { ...defaultProps, onChange: undefined as any };
      
      expect(() => render(<ConditionBuilder {...propsWithoutCallback} />)).not.toThrow();
    });

    it('should handle malformed conditions gracefully', () => {
      const malformedConditions = {
        id: 'root',
        operator: 'AND' as const,
        conditions: [null, undefined] as any
      };
      
      expect(() => 
        render(<ConditionBuilder {...defaultProps} conditions={malformedConditions} />)
      ).not.toThrow();
    });

    it('should handle empty available fields', () => {
      const propsWithoutFields = { ...defaultProps, availableFields: [] };
      
      expect(() => render(<ConditionBuilder {...propsWithoutFields} />)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle rapid condition additions', async () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /condição/i });
      
      // Adiciona múltiplas condições rapidamente
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      
      // Deve ter chamado onChange para cada clique
      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid operator changes', async () => {
      render(<ConditionBuilder {...defaultProps} />);
      
      const orButton = screen.getByRole('button', { name: /ou/i });
      const andButton = screen.getByRole('button', { name: /e/i });
      
      fireEvent.click(orButton);
      fireEvent.click(andButton);
      fireEvent.click(orButton);
      
      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
  });
});