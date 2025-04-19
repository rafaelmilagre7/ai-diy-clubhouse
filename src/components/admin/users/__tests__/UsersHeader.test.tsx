
import { render, screen, fireEvent } from '@testing-library/react';
import { UsersHeader } from '../UsersHeader';

describe('UsersHeader', () => {
  const mockProps = {
    searchQuery: '',
    onSearchChange: jest.fn(),
    onRefresh: jest.fn(),
    loading: false,
  };

  it('renders correctly', () => {
    render(<UsersHeader {...mockProps} />);
    
    expect(screen.getByText('Usuários')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar usuário...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument();
  });

  it('calls onSearchChange when input changes', () => {
    render(<UsersHeader {...mockProps} />);
    
    const input = screen.getByPlaceholderText('Buscar usuário...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(mockProps.onSearchChange).toHaveBeenCalledWith('test');
  });

  it('calls onRefresh when refresh button is clicked', () => {
    render(<UsersHeader {...mockProps} />);
    
    const button = screen.getByRole('button', { name: /atualizar/i });
    fireEvent.click(button);
    
    expect(mockProps.onRefresh).toHaveBeenCalled();
  });

  it('disables refresh button when loading', () => {
    render(<UsersHeader {...mockProps} loading={true} />);
    
    const button = screen.getByRole('button', { name: /atualizar/i });
    expect(button).toBeDisabled();
  });
});
