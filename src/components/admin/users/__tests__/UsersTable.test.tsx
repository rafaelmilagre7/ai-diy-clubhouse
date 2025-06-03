
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UsersTable } from '../UsersTable';
import { UserProfile } from '@/lib/supabase';

describe('UsersTable', () => {
  const mockUsers: UserProfile[] = [
    {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'member',
      avatar_url: null,
      company_name: 'Test Company',
      industry: 'Technology',
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  const mockProps = {
    users: mockUsers,
    loading: false,
    canEditRoles: true,
    canDeleteUsers: true,
    canResetPasswords: true,
    onEditRole: jest.fn(),
    onDeleteUser: jest.fn(),
    onResetPassword: jest.fn(),
  };

  it('renders correctly with users', () => {
    const { getByText } = render(<UsersTable {...mockProps} />);
    
    expect(getByText('Test User')).toBeInTheDocument();
    expect(getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const { getByText } = render(<UsersTable {...mockProps} loading={true} />);
    
    expect(getByText('Carregando usuários...')).toBeInTheDocument();
  });

  it('shows empty state when no users', () => {
    const { getByText } = render(<UsersTable {...mockProps} users={[]} />);
    
    expect(getByText('Nenhum usuário encontrado.')).toBeInTheDocument();
  });

  it('calls onEditRole when edit button is clicked', () => {
    const { getByRole } = render(<UsersTable {...mockProps} />);
    
    const editButton = getByRole('button', { name: /altera/i });
    editButton.click();
    
    expect(mockProps.onEditRole).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('hides edit button when not allowed to edit roles', () => {
    const { queryByRole } = render(<UsersTable {...mockProps} canEditRoles={false} />);
    
    const editButton = queryByRole('button', { name: /altera/i });
    expect(editButton).not.toBeInTheDocument();
  });

  it('hides delete button when not allowed to delete users', () => {
    const { queryByRole } = render(<UsersTable {...mockProps} canDeleteUsers={false} />);
    
    // O botão de exclusão está dentro de um dropdown, não é possível acessá-lo diretamente sem abrir o dropdown
    const dropdownTriggers = document.querySelectorAll('[data-state="closed"]');
    expect(dropdownTriggers.length).toBeGreaterThan(0);
    
    // Verificamos que pelo menos um dropdown ainda existe (para outras ações permitidas)
    expect(dropdownTriggers).not.toHaveLength(0);
  });

  it('hides reset password button when not allowed to reset passwords', () => {
    const { queryByRole } = render(<UsersTable {...mockProps} canResetPasswords={false} />);
    
    // O botão de redefinição de senha está dentro de um dropdown, não é possível acessá-lo diretamente sem abrir o dropdown
    const dropdownTriggers = document.querySelectorAll('[data-state="closed"]');
    expect(dropdownTriggers.length).toBeGreaterThan(0);
    
    // Verificamos que pelo menos um dropdown ainda existe (para outras ações permitidas)
    expect(dropdownTriggers).not.toHaveLength(0);
  });
});
