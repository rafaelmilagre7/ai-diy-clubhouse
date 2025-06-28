
import { render, screen } from '@testing-library/react';
import { UserRoleDialog } from '../UserRoleDialog';
import { createMockUserProfile } from '@/__tests__/utils/mockUserProfile';

// Mock do toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('UserRoleDialog', () => {
  const mockUser = createMockUserProfile({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
  });

  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    user: mockUser,
    newRoleId: 'admin-role-id',
    onRoleChange: jest.fn(),
    onUpdateRole: jest.fn(),
    saving: false,
    availableRoles: [
      { id: 'admin-role-id', name: 'Admin', description: 'Administrator' },
      { id: 'user-role-id', name: 'User', description: 'Regular User' }
    ],
    onSuccess: jest.fn()
  };

  it('renders correctly when open', () => {
    render(<UserRoleDialog {...defaultProps} />);
    
    expect(screen.getByText('Alterar Papel do Usuário')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<UserRoleDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Alterar Papel do Usuário')).not.toBeInTheDocument();
  });
});
