
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminToolsFilters, ToolCategory } from '@/components/admin/tools/AdminToolsFilters';

describe('AdminToolsFilters', () => {
  const mockOnSearchChange = jest.fn();
  const mockOnCategoryChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renderiza os campos de busca e filtro de categoria', () => {
    render(
      <AdminToolsFilters 
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
      />
    );
    
    expect(screen.getByTestId('tool-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('category-select')).toBeInTheDocument();
  });
  
  it('chama onSearchChange quando o input de busca é alterado', () => {
    render(
      <AdminToolsFilters 
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
      />
    );
    
    const searchInput = screen.getByTestId('tool-search-input');
    fireEvent.change(searchInput, { target: { value: 'teste' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('teste');
  });
  
  it('mantém a funcionalidade com valores nulos ou inesperados', () => {
    render(
      <AdminToolsFilters 
        searchQuery={undefined as unknown as string}
        onSearchChange={mockOnSearchChange}
        selectedCategory={undefined as unknown as ToolCategory}
        onCategoryChange={mockOnCategoryChange}
      />
    );
    
    // Verifica se o componente renderiza sem erros mesmo com valores undefined
    expect(screen.getByTestId('tool-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('category-select')).toBeInTheDocument();
  });
});
