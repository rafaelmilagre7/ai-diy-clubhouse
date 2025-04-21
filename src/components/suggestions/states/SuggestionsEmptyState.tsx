
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageSquarePlus, SearchX } from 'lucide-react';

interface SuggestionsEmptyStateProps {
  searchQuery?: string;
}

export const SuggestionsEmptyState: React.FC<SuggestionsEmptyStateProps> = ({ searchQuery }) => {
  const navigate = useNavigate();
  
  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <SearchX className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">Nenhuma sugestão encontrada</h3>
        <p className="text-muted-foreground mt-2 mb-6 max-w-md">
          Não encontramos nenhuma sugestão para "{searchQuery}". Tente usar termos diferentes ou crie uma nova sugestão.
        </p>
        <Button onClick={() => navigate('/suggestions/new')}>
          Criar Nova Sugestão
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <MessageSquarePlus className="h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium">Ainda não há sugestões</h3>
      <p className="text-muted-foreground mt-2 mb-6 max-w-md">
        Seja o primeiro a compartilhar uma ideia ou sugestão para melhorarmos o VIVER DE IA Club.
      </p>
      <Button onClick={() => navigate('/suggestions/new')}>
        Criar Primeira Sugestão
      </Button>
    </div>
  );
};
