
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
    isAdminMaster: true,
    onEditRole: jest.fn(),
  };

  it('renders correctly with users', () => {
    const { getByText } = render(<UsersTable {...mockProps} />);
    
    expect(getByText('Test User')).toBeInTheDocument();
    expect(getByText('test@example.com')).toBeInTheDocument();
    expect(getByText('Test Company')).toBeInTheDocument();
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
    
    const editButton = getByRole('button', { name: /alterar função/i });
    editButton.click();
    
    expect(mockProps.onEditRole).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('hides edit button when not admin master', () => {
    const { queryByRole } = render(<UsersTable {...mockProps} isAdminMaster={false} />);
    
    const editButton = queryByRole('button', { name: /alterar função/i });
    expect(editButton).not.toBeInTheDocument();
  });
});
