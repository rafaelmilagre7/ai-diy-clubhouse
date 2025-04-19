
import { render, screen, fireEvent } from '@testing-library/react';
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
    render(<UsersTable {...mockProps} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<UsersTable {...mockProps} loading={true} />);
    
    expect(screen.getByText('Carregando usuários...')).toBeInTheDocument();
  });

  it('shows empty state when no users', () => {
    render(<UsersTable {...mockProps} users={[]} />);
    
    expect(screen.getByText('Nenhum usuário encontrado.')).toBeInTheDocument();
  });

  it('calls onEditRole when edit button is clicked', () => {
    render(<UsersTable {...mockProps} />);
    
    const editButton = screen.getByRole('button', { name: /alterar função/i });
    fireEvent.click(editButton);
    
    expect(mockProps.onEditRole).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('hides edit button when not admin master', () => {
    render(<UsersTable {...mockProps} isAdminMaster={false} />);
    
    const editButton = screen.queryByRole('button', { name: /alterar função/i });
    expect(editButton).not.toBeInTheDocument();
  });
});
