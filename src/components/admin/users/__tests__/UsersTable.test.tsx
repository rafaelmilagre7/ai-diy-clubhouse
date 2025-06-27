
import { render, screen } from '@testing-library/react';
import { UsersTable } from '../UsersTable';
import { createMockUserProfile } from '@/__tests__/utils/mockUserProfile';

describe('UsersTable', () => {
  const mockUsers = [
    createMockUserProfile()
  ];

  const defaultProps = {
    users: mockUsers,
    loading: false,
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
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
