
import { render, screen } from '@testing-library/react';
import { UsersHeader } from '../UsersHeader';

describe('UsersHeader', () => {
  const defaultProps = {
    searchQuery: '',
    onSearch: jest.fn(),
    onRefresh: jest.fn(),
    isRefreshing: false,
    canManageUsers: true,
  };

  it('renders correctly', () => {
    render(<UsersHeader {...defaultProps} />);
    
    expect(screen.getByText('Gerenciamento de Usuários')).toBeInTheDocument();
  });

  it('renders with search functionality', () => {
    render(<UsersHeader {...defaultProps} searchQuery="test" />);
    
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });
});
