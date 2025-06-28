
import { render, screen } from '@testing-library/react';
import { UsersTable } from '../UsersTable';
import { createMockUserProfile } from '@/__tests__/utils/mockUserProfile';

describe('UsersTable', () => {
  const mockUsers = [
    createMockUserProfile({ id: '1', name: 'User 1', email: 'user1@example.com' }),
    createMockUserProfile({ id: '2', name: 'User 2', email: 'user2@example.com' }),
  ];

  const defaultProps = {
    users: mockUsers,
    loading: false,
    canAssignRoles: true,
    canEditRoles: true,
    canDeleteUsers: true,
    canResetPasswords: true,
    onEditRole: jest.fn(),
    onDeleteUser: jest.fn(),
    onResetPassword: jest.fn(),
    onResetUser: jest.fn(),
    onRefresh: jest.fn(),
  };

  it('renders users correctly', () => {
    render(<UsersTable {...defaultProps} />);
    
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<UsersTable {...defaultProps} loading={true} />);
    
    expect(screen.getByText('Carregando usuários...')).toBeInTheDocument();
  });
});
