
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface SuggestionsEmptyStateProps {
  searchQuery?: string;
}

export const SuggestionsEmptyState = ({ searchQuery }: SuggestionsEmptyStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-8 bg-white rounded-lg border border-dashed">
      <div className="flex flex-col items-center px-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-12 w-12 text-muted-foreground mb-3"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
          />
        </svg>
        <h3 className="text-lg font-medium">Nenhuma sugestão encontrada</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-md">
          {searchQuery 
            ? `Não encontramos sugestões contendo "${searchQuery}". Tente uma busca diferente.` 
            : 'Seja o primeiro a compartilhar uma sugestão para melhorar nossa plataforma!'}
        </p>
        <Button className="mt-4" onClick={() => navigate('/suggestions/new')}>
          Criar nova sugestão
        </Button>
      </div>
    </div>
  );
};
