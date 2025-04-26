import React from 'react';
import { render, screen } from '@testing-library/react';
import { SuggestionsContent } from '@/components/suggestions/layout/SuggestionsContent';
import { BrowserRouter } from 'react-router-dom';
import { Suggestion } from '@/types/suggestionTypes';

describe('SuggestionsContent', () => {
  // Mock mínimo de uma sugestão
  const mockSuggestion: Suggestion = {
    id: '1',
    title: 'Teste de sugestão',
    description: 'Descrição de teste',
    user_id: 'user1',
    status: 'new',
    upvotes: 5,
    downvotes: 1,
    comment_count: 3,
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
    is_pinned: false,
    is_hidden: false,
    category: 'Teste',
    is_implemented: false
  };

  it('renderiza uma mensagem quando não há sugestões', () => {
    render(
      <BrowserRouter>
        <SuggestionsContent
          suggestions={[]}
          searchQuery=""
          isLoading={false}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Nenhuma sugestão encontrada')).toBeInTheDocument();
  });

  it('renderiza uma sugestão com todos os campos obrigatórios', () => {
    render(
      <BrowserRouter>
        <SuggestionsContent
          suggestions={[mockSuggestion]}
          searchQuery=""
          isLoading={false}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Teste de sugestão')).toBeInTheDocument();
    expect(screen.getByText('Teste')).toBeInTheDocument(); // categoria
  });

  it('renderiza skeletons durante o carregamento', () => {
    render(
      <BrowserRouter>
        <SuggestionsContent
          suggestions={[]}
          searchQuery=""
          isLoading={true}
        />
      </BrowserRouter>
    );

    // Verificar se os skeletons estão presentes
    const skeletons = document.querySelectorAll('.h-6.w-4\\/5');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('lida com sugestões com dados incompletos sem quebrar', () => {
    const incompleteSuggestion: Partial<Suggestion> = {
      id: '2',
      title: 'Sugestão incompleta',
      description: 'Sem categoria ou status',
      user_id: 'user1',
      upvotes: 0,
      downvotes: 0,
      comment_count: 0,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      is_pinned: false,
      is_hidden: false
    };

    render(
      <BrowserRouter>
        <SuggestionsContent
          // @ts-ignore - Intencionalmente testando com dados incompletos
          suggestions={[incompleteSuggestion]}
          searchQuery=""
          isLoading={false}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Sugestão incompleta')).toBeInTheDocument();
  });

  it('renderiza corretamente quando category é um objeto', () => {
    const suggestionWithObjectCategory: Suggestion = {
      id: '1',
      title: 'Teste',
      description: 'Descrição',
      user_id: 'user1',
      status: 'new',
      upvotes: 5,
      downvotes: 1,
      comment_count: 3,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      is_pinned: false,
      is_hidden: false,
      category: { name: 'Categoria Teste' },
      is_implemented: true
    };

    render(
      <BrowserRouter>
        <SuggestionsContent
          suggestions={[suggestionWithObjectCategory]}
          searchQuery=""
          isLoading={false}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Categoria Teste')).toBeInTheDocument();
  });

  it('renderiza corretamente quando category é uma string', () => {
    const suggestionWithStringCategory: Suggestion = {
      id: '1',
      title: 'Teste',
      description: 'Descrição',
      user_id: 'user1',
      status: 'new',
      upvotes: 5,
      downvotes: 1,
      comment_count: 3,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      is_pinned: false,
      is_hidden: false,
      category: 'Categoria String',
      is_implemented: false
    };

    render(
      <BrowserRouter>
        <SuggestionsContent
          suggestions={[suggestionWithStringCategory]}
          searchQuery=""
          isLoading={false}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Categoria String')).toBeInTheDocument();
  });

  it('não quebra quando category está ausente', () => {
    const suggestionWithoutCategory: Suggestion = {
      id: '1',
      title: 'Teste sem categoria',
      description: 'Descrição',
      user_id: 'user1',
      status: 'new',
      upvotes: 0,
      downvotes: 0,
      comment_count: 0,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      is_pinned: false,
      is_hidden: false
    };

    render(
      <BrowserRouter>
        <SuggestionsContent
          suggestions={[suggestionWithoutCategory]}
          searchQuery=""
          isLoading={false}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Teste sem categoria')).toBeInTheDocument();
  });
});
