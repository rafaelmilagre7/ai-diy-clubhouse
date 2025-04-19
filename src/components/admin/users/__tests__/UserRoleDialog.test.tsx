
import { render, screen, fireEvent } from '@testing-library/react';
import { UserRoleDialog } from '../UserRoleDialog';
import { UserProfile } from '@/lib/supabase';

describe('UserRoleDialog', () => {
  const mockUser: UserProfile = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'member',
    avatar_url: null,
    company_name: 'Test Company',
    industry: 'Technology',
    created_at: '2024-01-01T00:00:00Z',
  };

  const mockProps = {
    open: true,
    onOpenChange: jest.fn(),
    selectedUser: mockUser,
    newRole: 'member' as const,
    onRoleChange: jest.fn(),
    onUpdateRole: jest.fn(),
    saving: false,
  };

  it('renders correctly when open', () => {
    render(<UserRoleDialog {...mockProps} />);
    
    expect(screen.getByText('Alterar Função do Usuário')).toBeInTheDocument();
    expect(screen.getByText(/Test User/)).toBeInTheDocument();
  });

  it('calls onRoleChange when role is selected', () => {
    render(<UserRoleDialog {...mockProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'admin' } });
    
    expect(mockProps.onRoleChange).toHaveBeenCalledWith('admin');
  });

  it('disables buttons when saving', () => {
    render(<UserRoleDialog {...mockProps} saving={true} />);
    
    const saveButton = screen.getByRole('button', { name: /salvando/i });
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    
    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('calls onUpdateRole when save button is clicked', () => {
    render(<UserRoleDialog {...mockProps} />);
    
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    fireEvent.click(saveButton);
    
    expect(mockProps.onUpdateRole).toHaveBeenCalled();
  });
});
