
import { render, screen } from '@testing-library/react';
import { UserRoleDialog } from '../UserRoleDialog';
import { createMockUserProfile } from '@/__tests__/utils/mockUserProfile';

describe('UserRoleDialog', () => {
  const mockUser = createMockUserProfile();

  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    selectedUser: mockUser,
    newRoleId: 'test-role-id',
    onRoleChange: jest.fn(),
    onUpdateRole: jest.fn(),
    saving: false,
    availableRoles: [
      { id: 'role-1', name: 'admin', description: 'Administrator', is_system: true, permissions: {}, created_at: '', updated_at: '' },
      { id: 'role-2', name: 'member', description: 'Member', is_system: false, permissions: {}, created_at: '', updated_at: '' }
    ]
  };

  it('renders correctly when open', () => {
    render(<UserRoleDialog {...defaultProps} />);
    expect(screen.getByText('Alterar Papel do Usuário')).toBeInTheDocument();
  });
});
