
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UsersHeader } from '../UsersHeader';

describe('UsersHeader', () => {
  const mockProps = {
    searchQuery: '',
    onSearchChange: jest.fn(),
    onRefresh: jest.fn(),
    loading: false,
  };

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText, getByRole } = render(<UsersHeader {...mockProps} />);
    
    expect(getByText('Usuários')).toBeInTheDocument();
    expect(getByPlaceholderText('Buscar usuário...')).toBeInTheDocument();
    expect(getByRole('button', { name: /atualizar/i })).toBeInTheDocument();
  });

  it('calls onSearchChange when input changes', () => {
    const { getByPlaceholderText } = render(<UsersHeader {...mockProps} />);
    
    const input = getByPlaceholderText('Buscar usuário...');
    input.dispatchEvent(new Event('change', { bubbles: true }));
    
    expect(mockProps.onSearchChange).toHaveBeenCalled();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    const { getByRole } = render(<UsersHeader {...mockProps} />);
    
    const button = getByRole('button', { name: /atualizar/i });
    button.click();
    
    expect(mockProps.onRefresh).toHaveBeenCalled();
  });

  it('disables refresh button when loading', () => {
    const { getByRole } = render(<UsersHeader {...mockProps} loading={true} />);
    
    const button = getByRole('button', { name: /atualizar/i });
    expect(button).toBeDisabled();
  });
});
