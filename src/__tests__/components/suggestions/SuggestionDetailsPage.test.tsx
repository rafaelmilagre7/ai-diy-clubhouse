
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SuggestionDetailsPage from '@/pages/member/SuggestionDetails';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';
import { useComments } from '@/hooks/suggestions/useComments';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { useAuth } from '@/contexts/auth';

// Mockando os hooks necessários
jest.mock('@/contexts/auth', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/hooks/suggestions/useSuggestionDetails', () => ({
  useSuggestionDetails: jest.fn()
}));

jest.mock('@/hooks/suggestions/useComments', () => ({
  useComments: jest.fn()
}));

jest.mock('@/hooks/suggestions/useAdminSuggestions', () => ({
  useAdminSuggestions: jest.fn()
}));

describe('SuggestionDetailsPage', () => {
  beforeEach(() => {
    // Mock padrão para useAuth
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-123' },
      isAdmin: false
    });

    // Mock padrão para useComments
    (useComments as jest.Mock).mockReturnValue({
      comment: '',
      setComment: jest.fn(),
      comments: [],
      commentsLoading: false,
      isSubmitting: false,
      handleSubmitComment: jest.fn()
    });

    // Mock padrão para useAdminSuggestions
    (useAdminSuggestions as jest.Mock).mockReturnValue({
      removeSuggestion: jest.fn(),
      updateSuggestionStatus: jest.fn(),
      loading: false
    });
  });

  it('deve renderizar corretamente quando category é string', () => {
    // Configurando o mock para retornar category como string
    (useSuggestionDetails as jest.Mock).mockReturnValue({
      suggestion: {
        id: 'sug-123',
        title: 'Teste de Sugestão',
        description: 'Descrição da sugestão',
        status: 'new',
        user_id: 'user-123',
        created_at: '2023-01-01T00:00:00.000Z',
        upvotes: 5,
        downvotes: 1,
        comment_count: 2,
        category: 'Funcionalidade', // Category como string
        updated_at: '2023-01-01T00:00:00.000Z',
        is_pinned: false,
        is_hidden: false
      },
      isLoading: false,
      error: null,
      userVote: null,
      voteLoading: false,
      handleVote: jest.fn(),
      refetch: jest.fn()
    });

    render(
      <BrowserRouter>
        <SuggestionDetailsPage />
      </BrowserRouter>
    );

    // Verificando se o componente renderizou sem erros
    expect(screen.getByText('Teste de Sugestão')).toBeInTheDocument();
  });

  it('deve renderizar corretamente quando category é objeto', () => {
    // Configurando o mock para retornar category como objeto
    (useSuggestionDetails as jest.Mock).mockReturnValue({
      suggestion: {
        id: 'sug-123',
        title: 'Teste de Sugestão',
        description: 'Descrição da sugestão',
        status: 'new',
        user_id: 'user-123',
        created_at: '2023-01-01T00:00:00.000Z',
        upvotes: 5,
        downvotes: 1,
        comment_count: 2,
        category: { name: 'Funcionalidade' }, // Category como objeto
        updated_at: '2023-01-01T00:00:00.000Z',
        is_pinned: false,
        is_hidden: false
      },
      isLoading: false,
      error: null,
      userVote: null,
      voteLoading: false,
      handleVote: jest.fn(),
      refetch: jest.fn()
    });

    render(
      <BrowserRouter>
        <SuggestionDetailsPage />
      </BrowserRouter>
    );

    // Verificando se o componente renderizou sem erros
    expect(screen.getByText('Teste de Sugestão')).toBeInTheDocument();
  });

  it('deve mostrar estado de erro quando suggestion for nulo', () => {
    (useSuggestionDetails as jest.Mock).mockReturnValue({
      suggestion: null,
      isLoading: false,
      error: new Error('Erro ao carregar sugestão'),
      userVote: null,
      voteLoading: false,
      handleVote: jest.fn(),
      refetch: jest.fn()
    });

    render(
      <BrowserRouter>
        <SuggestionDetailsPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Erro: Erro ao carregar sugestão/i)).toBeInTheDocument();
  });
});
