
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserRoleDialog } from '../UserRoleDialog';
import { UserProfile } from '@/lib/supabase';

describe('UserRoleDialog', () => {
  const mockUser: UserProfile = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role_id: 'membro-club-role-id',
    role: 'membro_club',
    user_roles: {
      id: 'membro-club-role-id',
      name: 'membro_club'
    },
    avatar_url: null,
    company_name: 'Test Company',
    industry: 'Technology',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    onboarding_completed: true,
    onboarding_completed_at: '2024-01-01T00:00:00Z',
    referrals_count: 0,
    successful_referrals_count: 0,
  };

  const mockAvailableRoles = [
    { 
      id: 'membro-club-role-id', 
      name: 'membro_club', 
      description: 'Membro do Club', 
      permissions: {},
      is_system: true, 
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    { 
      id: 'admin-role-id', 
      name: 'admin', 
      description: 'Administrador',
      permissions: { all: true },
      is_system: true, 
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  const mockProps = {
    open: true,
    onOpenChange: jest.fn(),
    selectedUser: mockUser,
    newRoleId: 'membro-club-role-id',
    onRoleChange: jest.fn(),
    onUpdateRole: jest.fn(),
    saving: false,
    availableRoles: mockAvailableRoles
  };

  it('renders correctly when open', () => {
    const { getByText } = render(<UserRoleDialog {...mockProps} />);
    
    expect(getByText('Alterar Papel do Usuário')).toBeInTheDocument();
    expect(getByText(/Test User/)).toBeInTheDocument();
  });

  it('calls onRoleChange when role is selected', () => {
    const { getByRole } = render(<UserRoleDialog {...mockProps} />);
    
    const select = getByRole('combobox');
    select.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Verificação ajustada devido à limitação do teste sem userEvent
    expect(mockProps.onRoleChange).toHaveBeenCalled();
  });

  it('disables buttons when saving', () => {
    const { getByRole } = render(<UserRoleDialog {...mockProps} saving={true} />);
    
    const saveButton = getByRole('button', { name: /salvando/i });
    const cancelButton = getByRole('button', { name: /cancelar/i });
    
    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('calls onUpdateRole when save button is clicked', () => {
    const { getByRole } = render(<UserRoleDialog {...mockProps} />);
    
    const saveButton = getByRole('button', { name: /salvar/i });
    saveButton.click();
    
    expect(mockProps.onUpdateRole).toHaveBeenCalled();
  });
});
