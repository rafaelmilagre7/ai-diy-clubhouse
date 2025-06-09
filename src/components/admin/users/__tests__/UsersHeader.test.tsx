
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { UsersHeader } from '../UsersHeader';

describe('UsersHeader', () => {
  const mockProps = {
    searchQuery: '',
    onSearchChange: jest.fn(),
    onRefresh: jest.fn(),
    isRefreshing: false,
  };

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<UsersHeader {...mockProps} />);
    
    expect(getByText('Gerenciamento de Usuários')).toBeInTheDocument();
    expect(getByPlaceholderText('Buscar por nome, email ou empresa...')).toBeInTheDocument();
  });

  it('calls onSearchChange when input changes', async () => {
    const user = userEvent.setup();
    const { getByPlaceholderText } = render(<UsersHeader {...mockProps} />);
    
    const input = getByPlaceholderText('Buscar por nome, email ou empresa...');
    await user.type(input, 'teste');
    
    expect(mockProps.onSearchChange).toHaveBeenCalled();
  });
});
