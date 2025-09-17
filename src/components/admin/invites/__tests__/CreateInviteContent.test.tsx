import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CreateInviteContent from '../CreateInviteContent';
import { useInviteCreate } from '@/hooks/admin/invites/useInviteCreate';

// Mock do hook
vi.mock('@/hooks/admin/invites/useInviteCreate');
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock do componente PhoneInput
vi.mock('react-international-phone', () => ({
  PhoneInput: ({ onChange, value, ...props }: any) => (
    <input
      data-testid="phone-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  ),
}));

const mockRoles = [
  { id: '1', name: 'Admin' },
  { id: '2', name: 'User' },
  { id: '3', name: 'Manager' },
];

const mockProps = {
  roles: mockRoles,
  onInviteCreated: vi.fn(),
  onClose: vi.fn(),
};

const mockUseInviteCreate = {
  createInvite: vi.fn(),
  isCreating: false,
};

describe('CreateInviteContent - Canal de Envio RadioGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useInviteCreate as any).mockReturnValue(mockUseInviteCreate);
  });

  it('deve renderizar todas as opções de canal', () => {
    render(<CreateInviteContent {...mockProps} />);
    
    expect(screen.getByTestId('channel-option-email')).toBeInTheDocument();
    expect(screen.getByTestId('channel-option-whatsapp')).toBeInTheDocument();
    expect(screen.getByTestId('channel-option-both')).toBeInTheDocument();
  });

  it('deve ter "email" selecionado por padrão', () => {
    render(<CreateInviteContent {...mockProps} />);
    
    const emailRadio = screen.getByRole('radio', { name: /email/i });
    expect(emailRadio).toBeChecked();
  });

  describe('Seleção via clique no container', () => {
    it('deve selecionar Email ao clicar no container', async () => {
      const user = userEvent.setup();
      render(<CreateInviteContent {...mockProps} />);
      
      const whatsappOption = screen.getByTestId('channel-option-whatsapp');
      await user.click(whatsappOption);
      
      const whatsappRadio = screen.getByRole('radio', { name: /whatsapp/i });
      expect(whatsappRadio).toBeChecked();
    });

    it('deve selecionar WhatsApp ao clicar no container', async () => {
      const user = userEvent.setup();
      render(<CreateInviteContent {...mockProps} />);
      
      const whatsappOption = screen.getByTestId('channel-option-whatsapp');
      await user.click(whatsappOption);
      
      const whatsappRadio = screen.getByRole('radio', { name: /whatsapp/i });
      expect(whatsappRadio).toBeChecked();
    });

    it('deve selecionar Both ao clicar no container', async () => {
      const user = userEvent.setup();
      render(<CreateInviteContent {...mockProps} />);
      
      const bothOption = screen.getByTestId('channel-option-both');
      await user.click(bothOption);
      
      const bothRadio = screen.getByRole('radio', { name: /email \+ whatsapp/i });
      expect(bothRadio).toBeChecked();
    });
  });

  describe('Seleção via RadioGroupItem', () => {
    it('deve selecionar ao clicar diretamente no radio button', async () => {
      const user = userEvent.setup();
      render(<CreateInviteContent {...mockProps} />);
      
      const whatsappRadio = screen.getByRole('radio', { name: /whatsapp/i });
      await user.click(whatsappRadio);
      
      expect(whatsappRadio).toBeChecked();
    });
  });

  describe('Seleção via Label', () => {
    it('deve selecionar ao clicar no label', async () => {
      const user = userEvent.setup();
      render(<CreateInviteContent {...mockProps} />);
      
      const whatsappLabel = screen.getByText('WhatsApp');
      await user.click(whatsappLabel);
      
      const whatsappRadio = screen.getByRole('radio', { name: /whatsapp/i });
      expect(whatsappRadio).toBeChecked();
    });
  });

  describe('Navegação via teclado', () => {
    it('deve permitir seleção via Enter', async () => {
      const user = userEvent.setup();
      render(<CreateInviteContent {...mockProps} />);
      
      const whatsappOption = screen.getByTestId('channel-option-whatsapp');
      whatsappOption.focus();
      await user.keyboard('{Enter}');
      
      const whatsappRadio = screen.getByRole('radio', { name: /whatsapp/i });
      expect(whatsappRadio).toBeChecked();
    });

    it('deve permitir seleção via Space', async () => {
      const user = userEvent.setup();
      render(<CreateInviteContent {...mockProps} />);
      
      const bothOption = screen.getByTestId('channel-option-both');
      bothOption.focus();
      await user.keyboard(' ');
      
      const bothRadio = screen.getByRole('radio', { name: /email \+ whatsapp/i });
      expect(bothRadio).toBeChecked();
    });
  });

  describe('Validação de formulário baseada na seleção', () => {
    it('deve exigir telefone quando WhatsApp é selecionado', async () => {
      const user = userEvent.setup();
      render(<CreateInviteContent {...mockProps} />);
      
      // Preencher campos obrigatórios
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Admin'));
      
      // Selecionar WhatsApp
      const whatsappOption = screen.getByTestId('channel-option-whatsapp');
      await user.click(whatsappOption);
      
      // Verificar se o label do telefone mostra que é obrigatório
      expect(screen.getByText(/telefone \*/i)).toBeInTheDocument();
    });

    it('deve exigir telefone quando Both é selecionado', async () => {
      const user = userEvent.setup();
      render(<CreateInviteContent {...mockProps} />);
      
      // Selecionar Both
      const bothOption = screen.getByTestId('channel-option-both');
      await user.click(bothOption);
      
      // Verificar se o label do telefone mostra que é obrigatório
      expect(screen.getByText(/telefone \*/i)).toBeInTheDocument();
    });

    it('não deve exigir telefone quando apenas Email é selecionado', async () => {
      const user = userEvent.setup();
      render(<CreateInviteContent {...mockProps} />);
      
      // Email já está selecionado por padrão
      // Verificar se o telefone não é obrigatório
      expect(screen.queryByText(/telefone \*/i)).not.toBeInTheDocument();
      expect(screen.getByText('Telefone')).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter aria-labels corretos', () => {
      render(<CreateInviteContent {...mockProps} />);
      
      expect(screen.getByLabelText('Selecionar Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Selecionar WhatsApp')).toBeInTheDocument();
      expect(screen.getByLabelText('Selecionar Email e WhatsApp')).toBeInTheDocument();
    });

    it('deve ter role radiogroup no container principal', () => {
      render(<CreateInviteContent {...mockProps} />);
      
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveAttribute('aria-label', 'Selecione o canal de envio do convite');
    });

    it('deve permitir navegação via Tab', async () => {
      const user = userEvent.setup();
      render(<CreateInviteContent {...mockProps} />);
      
      // Navegar até as opções de canal
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab(); // Chegar no primeiro canal
      
      const emailOption = screen.getByTestId('channel-option-email');
      expect(emailOption).toHaveFocus();
    });
  });

  describe('Feedback visual', () => {
    it('deve aplicar estilos de hover', () => {
      render(<CreateInviteContent {...mockProps} />);
      
      const emailOption = screen.getByTestId('channel-option-email');
      expect(emailOption).toHaveClass('hover:bg-gray-800/50');
    });

    it('deve aplicar estilos de focus', () => {
      render(<CreateInviteContent {...mockProps} />);
      
      const emailOption = screen.getByTestId('channel-option-email');
      expect(emailOption).toHaveClass('focus-within:ring-2', 'focus-within:ring-blue-500');
    });

    it('deve ter cursor pointer', () => {
      render(<CreateInviteContent {...mockProps} />);
      
      const emailOption = screen.getByTestId('channel-option-email');
      expect(emailOption).toHaveClass('cursor-pointer');
    });
  });
});