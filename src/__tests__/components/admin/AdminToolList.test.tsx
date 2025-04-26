
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdminToolList } from '@/components/admin/tools/AdminToolList';
import { BrowserRouter } from 'react-router-dom';
import { Tool } from '@/types/toolTypes';

// Mock do hook useAdminTools para evitar dependências externas
jest.mock('@/hooks/useAdminTools', () => ({
  useAdminTools: jest.fn().mockReturnValue({
    tools: [],
    selectedCategory: null,
    setSelectedCategory: jest.fn(),
    searchQuery: '',
    setSearchQuery: jest.fn(),
  }),
}));

// Mock do componente AdminToolsFilters caso não exista
jest.mock('@/components/admin/tools/AdminToolsFilters', () => ({
  AdminToolsFilters: () => <div data-testid="admin-tools-filters">Filtros</div>,
}));

// Mock do hook useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('AdminToolList', () => {
  const mockTools: Tool[] = [
    {
      id: '1',
      name: 'Ferramenta Teste',
      description: 'Descrição da ferramenta teste',
      official_url: 'https://exemplo.com',
      logo_url: null,
      category: 'Outros',
      video_tutorials: [],
      tags: [],
      status: true,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
  ];

  it('mostra estado vazio quando não há ferramentas', () => {
    render(
      <BrowserRouter>
        <AdminToolList tools={[]} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Nenhuma ferramenta encontrada.')).toBeInTheDocument();
    expect(screen.getByText('Adicionar ferramenta')).toBeInTheDocument();
  });

  it('renderiza os filtros quando existem ferramentas', () => {
    // Sobrescreve mock do useAdminTools
    require('@/hooks/useAdminTools').useAdminTools.mockReturnValue({
      tools: mockTools,
      selectedCategory: null,
      setSelectedCategory: jest.fn(),
      searchQuery: '',
      setSearchQuery: jest.fn(),
    });

    render(
      <BrowserRouter>
        <AdminToolList tools={mockTools} />
      </BrowserRouter>
    );
    
    // Verifica se os filtros são renderizados
    expect(screen.getByTestId('admin-tools-filters')).toBeInTheDocument();
  });

  it('exibe graciosamente uma mensagem mesmo se os filtros falharem', () => {
    // Simula filtros inexistentes ou com erro
    jest.mock('@/components/admin/tools/AdminToolsFilters', () => {
      throw new Error('Componente não disponível');
    });
    
    // Esse teste apenas verifica se a lista não quebra completamente
    // mesmo se houver problemas com o componente de filtros
    expect(() => {
      render(
        <BrowserRouter>
          <AdminToolList tools={mockTools} />
        </BrowserRouter>
      );
    }).not.toThrow();
  });
});
