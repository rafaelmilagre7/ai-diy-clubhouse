import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { ActionSelector } from '@/components/automations/ActionSelector';
import { render, resetAllMocks, createMockEvent } from '@/__tests__/utils/testUtils';

describe('ActionSelector', () => {
  const mockOnChange = jest.fn();
  const mockActions = [
    {
      type: 'send_invite',
      parameters: {
        role_id: 'lovable_course',
        template: 'lovable_welcome',
        channels: ['email', 'whatsapp'],
        expires_in: '7 days'
      },
      enabled: true,
      order: 1
    }
  ];

  const defaultProps = {
    actions: mockActions,
    onChange: mockOnChange
  };

  beforeEach(() => {
    resetAllMocks();
    mockOnChange.mockClear();
  });

  describe('Add Action Button', () => {
    it('should add new action when "Adicionar" button is clicked', async () => {
      render(<ActionSelector {...defaultProps} actions={[]} />);
      
      // Seleciona um tipo de ação
      const actionSelect = screen.getByRole('combobox');
      fireEvent.click(actionSelect);
      
      const sendInviteOption = screen.getByText(/enviar convite/i);
      fireEvent.click(sendInviteOption);
      
      // Clica no botão adicionar
      const addButton = screen.getByRole('button', { name: /adicionar/i });
      fireEvent.click(addButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          expect.objectContaining({
            type: 'send_invite',
            enabled: true,
            order: 1
          })
        ]);
      });
    });

    it('should not add action when no action type is selected', () => {
      render(<ActionSelector {...defaultProps} actions={[]} />);
      
      const addButton = screen.getByRole('button', { name: /adicionar/i });
      expect(addButton).toBeDisabled();
    });

    it('should clear action type selection after adding', async () => {
      render(<ActionSelector {...defaultProps} actions={[]} />);
      
      // Seleciona e adiciona uma ação
      const actionSelect = screen.getByRole('combobox');
      fireEvent.click(actionSelect);
      
      const sendEmailOption = screen.getByText(/enviar email/i);
      fireEvent.click(sendEmailOption);
      
      const addButton = screen.getByRole('button', { name: /adicionar/i });
      fireEvent.click(addButton);
      
      await waitFor(() => {
        expect(addButton).toBeDisabled();
      });
    });

    it('should display all available action types in dropdown', () => {
      render(<ActionSelector {...defaultProps} actions={[]} />);
      
      const actionSelect = screen.getByRole('combobox');
      fireEvent.click(actionSelect);
      
      expect(screen.getByText(/enviar convite/i)).toBeInTheDocument();
      expect(screen.getByText(/criar usuário/i)).toBeInTheDocument();
      expect(screen.getByText(/enviar email/i)).toBeInTheDocument();
      expect(screen.getByText(/enviar whatsapp/i)).toBeInTheDocument();
      expect(screen.getByText(/chamar webhook/i)).toBeInTheDocument();
      expect(screen.getByText(/atualizar perfil/i)).toBeInTheDocument();
    });
  });

  describe('Remove Action Button', () => {
    it('should remove action when X button is clicked', async () => {
      render(<ActionSelector {...defaultProps} />);
      
      const removeButton = screen.getByRole('button', { name: '' });
      fireEvent.click(removeButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([]);
      });
    });

    it('should update order after removing action', async () => {
      const multipleActions = [
        mockActions[0],
        {
          type: 'send_email',
          parameters: { template: 'test', subject: 'Test' },
          enabled: true,
          order: 2
        }
      ];
      
      render(<ActionSelector {...defaultProps} actions={multipleActions} />);
      
      // Remove a primeira ação
      const removeButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(removeButtons[0]);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([multipleActions[1]]);
      });
    });
  });

  describe('Action Parameters', () => {
    it('should update send_invite parameters correctly', async () => {
      render(<ActionSelector {...defaultProps} />);
      
      // Atualiza role_id
      const roleInput = screen.getByPlaceholderText(/id do papel do usuário/i);
      fireEvent.change(roleInput, createMockEvent('new_role'));
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          expect.objectContaining({
            parameters: expect.objectContaining({
              role_id: 'new_role'
            })
          })
        ]);
      });
    });

    it('should update template selection for send_invite', async () => {
      render(<ActionSelector {...defaultProps} />);
      
      const templateSelect = screen.getByDisplayValue(/template de boas-vindas/i);
      fireEvent.click(templateSelect);
      
      const premiumOption = screen.getByText(/template premium/i);
      fireEvent.click(premiumOption);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          expect.objectContaining({
            parameters: expect.objectContaining({
              template: 'premium_welcome'
            })
          })
        ]);
      });
    });

    it('should update email channel selection', async () => {
      render(<ActionSelector {...defaultProps} />);
      
      const emailCheckbox = screen.getByRole('checkbox', { name: /email/i });
      fireEvent.click(emailCheckbox);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          expect.objectContaining({
            parameters: expect.objectContaining({
              channels: ['whatsapp'] // email removed
            })
          })
        ]);
      });
    });

    it('should update WhatsApp channel selection', async () => {
      render(<ActionSelector {...defaultProps} />);
      
      const whatsappCheckbox = screen.getByRole('checkbox', { name: /whatsapp/i });
      fireEvent.click(whatsappCheckbox);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          expect.objectContaining({
            parameters: expect.objectContaining({
              channels: ['email'] // whatsapp removed
            })
          })
        ]);
      });
    });
  });

  describe('Email Action Parameters', () => {
    it('should render email parameters correctly', () => {
      const emailAction = [{
        type: 'send_email',
        parameters: { template: 'test_template', subject: 'Test Subject' },
        enabled: true,
        order: 1
      }];
      
      render(<ActionSelector {...defaultProps} actions={emailAction} />);
      
      expect(screen.getByPlaceholderText(/nome do template/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/assunto do email/i)).toBeInTheDocument();
    });

    it('should update email template parameter', async () => {
      const emailAction = [{
        type: 'send_email',
        parameters: { template: 'old_template', subject: 'Test' },
        enabled: true,
        order: 1
      }];
      
      render(<ActionSelector {...defaultProps} actions={emailAction} />);
      
      const templateInput = screen.getByPlaceholderText(/nome do template/i);
      fireEvent.change(templateInput, createMockEvent('new_template'));
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          expect.objectContaining({
            parameters: expect.objectContaining({
              template: 'new_template'
            })
          })
        ]);
      });
    });
  });

  describe('Webhook Action Parameters', () => {
    it('should render webhook parameters correctly', () => {
      const webhookAction = [{
        type: 'webhook_call',
        parameters: {
          url: 'https://example.com',
          method: 'POST',
          headers: { 'Authorization': 'Bearer token' }
        },
        enabled: true,
        order: 1
      }];
      
      render(<ActionSelector {...defaultProps} actions={webhookAction} />);
      
      expect(screen.getByPlaceholderText(/https:\/\/example\.com\/webhook/i)).toBeInTheDocument();
    });

    it('should update webhook URL', async () => {
      const webhookAction = [{
        type: 'webhook_call',
        parameters: { url: 'https://old.com', method: 'POST', headers: {} },
        enabled: true,
        order: 1
      }];
      
      render(<ActionSelector {...defaultProps} actions={webhookAction} />);
      
      const urlInput = screen.getByPlaceholderText(/https:\/\/example\.com\/webhook/i);
      fireEvent.change(urlInput, createMockEvent('https://new.com'));
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          expect.objectContaining({
            parameters: expect.objectContaining({
              url: 'https://new.com'
            })
          })
        ]);
      });
    });

    it('should update webhook method', async () => {
      const webhookAction = [{
        type: 'webhook_call',
        parameters: { url: 'https://test.com', method: 'POST', headers: {} },
        enabled: true,
        order: 1
      }];
      
      render(<ActionSelector {...defaultProps} actions={webhookAction} />);
      
      const methodSelect = screen.getByDisplayValue('POST');
      fireEvent.click(methodSelect);
      
      const getOption = screen.getByText('GET');
      fireEvent.click(getOption);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          expect.objectContaining({
            parameters: expect.objectContaining({
              method: 'GET'
            })
          })
        ]);
      });
    });
  });

  describe('Action Toggle', () => {
    it('should toggle action enabled state', async () => {
      render(<ActionSelector {...defaultProps} />);
      
      const toggleSwitch = screen.getByRole('switch');
      fireEvent.click(toggleSwitch);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          expect.objectContaining({
            enabled: false
          })
        ]);
      });
    });

    it('should show correct switch state based on enabled property', () => {
      render(<ActionSelector {...defaultProps} />);
      
      const toggleSwitch = screen.getByRole('switch');
      expect(toggleSwitch).toBeChecked();
    });

    it('should handle disabled actions correctly', () => {
      const disabledAction = [{
        ...mockActions[0],
        enabled: false
      }];
      
      render(<ActionSelector {...defaultProps} actions={disabledAction} />);
      
      const toggleSwitch = screen.getByRole('switch');
      expect(toggleSwitch).not.toBeChecked();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no actions are configured', () => {
      render(<ActionSelector {...defaultProps} actions={[]} />);
      
      expect(screen.getByText(/nenhuma ação configurada/i)).toBeInTheDocument();
      expect(screen.getByText(/adicione uma ação acima para começar/i)).toBeInTheDocument();
    });

    it('should hide empty state when actions exist', () => {
      render(<ActionSelector {...defaultProps} />);
      
      expect(screen.queryByText(/nenhuma ação configurada/i)).not.toBeInTheDocument();
    });
  });

  describe('Actions Preview', () => {
    it('should show actions preview when actions exist', () => {
      render(<ActionSelector {...defaultProps} />);
      
      expect(screen.getByText(/preview das ações/i)).toBeInTheDocument();
    });

    it('should display JSON preview of actions', () => {
      render(<ActionSelector {...defaultProps} />);
      
      const previewElement = screen.getByText(/preview das ações/i).parentElement;
      const jsonPreview = previewElement?.querySelector('pre');
      
      expect(jsonPreview).toBeInTheDocument();
      expect(jsonPreview?.textContent).toContain('send_invite');
    });

    it('should hide preview when no actions exist', () => {
      render(<ActionSelector {...defaultProps} actions={[]} />);
      
      expect(screen.queryByText(/preview das ações/i)).not.toBeInTheDocument();
    });
  });

  describe('Action Ordering', () => {
    it('should assign correct order to new actions', async () => {
      render(<ActionSelector {...defaultProps} actions={mockActions} />);
      
      // Adiciona uma nova ação
      const actionSelect = screen.getByRole('combobox');
      fireEvent.click(actionSelect);
      
      const sendEmailOption = screen.getByText(/enviar email/i);
      fireEvent.click(sendEmailOption);
      
      const addButton = screen.getByRole('button', { name: /adicionar/i });
      fireEvent.click(addButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          mockActions[0],
          expect.objectContaining({
            order: 2 // Should be incremented
          })
        ]);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form elements', () => {
      render(<ActionSelector {...defaultProps} />);
      
      expect(screen.getByText(/role id/i)).toBeInTheDocument();
      expect(screen.getByText(/template/i)).toBeInTheDocument();
      expect(screen.getByText(/canais de entrega/i)).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<ActionSelector {...defaultProps} />);
      
      const actionSelect = screen.getByRole('combobox');
      actionSelect.focus();
      expect(actionSelect).toHaveFocus();
    });

    it('should have proper ARIA attributes', () => {
      render(<ActionSelector {...defaultProps} />);
      
      const toggleSwitch = screen.getByRole('switch');
      expect(toggleSwitch).toHaveAttribute('aria-checked');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON in headers gracefully', async () => {
      const webhookAction = [{
        type: 'webhook_call',
        parameters: { url: 'https://test.com', method: 'POST', headers: {} },
        enabled: true,
        order: 1
      }];
      
      render(<ActionSelector {...defaultProps} actions={webhookAction} />);
      
      const headersTextarea = screen.getByPlaceholderText(/{"Authorization": "Bearer token"}/i);
      fireEvent.change(headersTextarea, createMockEvent('invalid json'));
      
      // Should not throw an error or call onChange with invalid data
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should handle missing onChange callback gracefully', () => {
      const propsWithoutCallback = { ...defaultProps, onChange: undefined as any };
      
      expect(() => render(<ActionSelector {...propsWithoutCallback} />)).not.toThrow();
    });
  });
});