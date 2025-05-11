
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UsersHeader } from '../UsersHeader';

describe('UsersHeader', () => {
  const mockProps = {
    searchQuery: '',
    onSearchChange: jest.fn(),
  };

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<UsersHeader {...mockProps} />);
    
    expect(getByText('Usuários')).toBeInTheDocument();
    expect(getByPlaceholderText('Buscar usuário...')).toBeInTheDocument();
  });

  it('calls onSearchChange when input changes', () => {
    const { getByPlaceholderText } = render(<UsersHeader {...mockProps} />);
    
    const input = getByPlaceholderText('Buscar usuário...');
    fireEvent.change(input, { target: { value: 'teste' } });
    
    expect(mockProps.onSearchChange).toHaveBeenCalled();
  });
});
